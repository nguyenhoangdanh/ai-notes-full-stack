import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAI } from 'openai';

interface TextChunk {
  id: string;
  content: string;
  index: number;
  heading?: string;
}

interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}

@Injectable()
export class VectorsService {
  private openai: OpenAI | null = null;
  private openaiApiKey: string;
  private geminiApiKey: string;
  private useEmbeddings: boolean = false;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openaiApiKey = configService.get('OPENAI_API_KEY');
    this.geminiApiKey = configService.get('GOOGLE_GEMINI_API_KEY');
    
    // Priority: Gemini (free) -> OpenAI (paid)
    if (this.geminiApiKey) {
      console.log('✅ Google Gemini API key configured (Free tier available)');
      this.useEmbeddings = false; // Gemini doesn't support embeddings yet, use text search
    } else if (this.openaiApiKey && this.openaiApiKey.startsWith('sk-') && !this.openaiApiKey.includes('dummy')) {
      try {
        this.openai = new OpenAI({
          apiKey: this.openaiApiKey,
          timeout: 30000,
          maxRetries: 2,
        });
        this.useEmbeddings = true;
        console.log('✅ OpenAI configured for embeddings - will attempt to use');
      } catch (error) {
        console.warn('⚠️ OpenAI setup failed, using text search only');
        this.useEmbeddings = false;
      }
    } else {
      console.log('⚠️ No AI API key configured. Add GOOGLE_GEMINI_API_KEY (free) or OPENAI_API_KEY for enhanced search');
      this.useEmbeddings = false;
    }
  }

  async processNoteForRAG(noteId: string, userId: string) {
    // Get the note
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId, isDeleted: false },
    });

    if (!note) {
      throw new Error('Note not found');
    }

    // Remove existing vectors for this note
    await this.deleteByNote(noteId, userId);

    // Skip processing if note is empty
    if (!note.content.trim()) {
      console.log('Note is empty, skipping RAG processing');
      return;
    }

    // If embeddings are disabled, still create text-based vectors for search
    const chunks = this.chunkText(note.content, noteId);
    if (chunks.length === 0) return;

    console.log(`Processing ${chunks.length} chunks for note: ${note.title}`);

    // Always prefer text search for reliability, especially with Gemini
    if (this.geminiApiKey) {
      console.log('Using enhanced text search with Gemini API available');
      const textOnlyChunks = chunks.map(chunk => ({
        ...chunk,
        embedding: [], // Empty embedding array for text search
      }));
      
      await this.storeVectors(textOnlyChunks, noteId, userId);
      console.log('✅ Stored chunks for enhanced text search');
      return;
    }

    if (this.useEmbeddings && this.openai) {
      // Try to generate embeddings with OpenAI
      try {
        const embeddedChunks = await this.embedChunks(chunks);
        await this.storeVectors(embeddedChunks, noteId, userId);
        console.log('✅ Stored chunks with OpenAI embeddings');
        return;
      } catch (error) {
        console.warn('❌ OpenAI embedding failed, falling back to text search:', error.message);
        this.useEmbeddings = false; // Disable embeddings for future requests
      }
    }

    // Store chunks without embeddings (for text search)
    const textOnlyChunks = chunks.map(chunk => ({
      ...chunk,
      embedding: [], // Empty embedding array
    }));
    
    await this.storeVectors(textOnlyChunks, noteId, userId);
    console.log('✅ Stored chunks for text search only');
  }

  private async storeVectors(chunks: EmbeddedChunk[], noteId: string, userId: string) {
    for (const chunk of chunks) {
      await this.prisma.vector.create({
        data: {
          noteId,
          chunkId: chunk.id,
          chunkContent: chunk.content,
          chunkIndex: chunk.index,
          heading: chunk.heading,
          embedding: chunk.embedding,
          ownerId: userId,
        },
      });
    }
  }

  async deleteByNote(noteId: string, userId: string) {
    await this.prisma.vector.deleteMany({
      where: {
        noteId,
        ownerId: userId,
      },
    });
  }

  async semanticSearch(query: string, userId: string, limit: number = 5) {
    if (this.geminiApiKey) {
      console.log(`🔍 Searching for: "${query}" (using enhanced text search with Gemini available)`);
    } else {
      console.log(`🔍 Searching for: "${query}" (embeddings: ${this.useEmbeddings ? 'enabled' : 'disabled'})`);
    }
    
    // Always use enhanced text search for reliability
    return this.fallbackTextSearch(query, userId, limit);
  }

  private async fallbackTextSearch(query: string, userId: string, limit: number = 5) {
    console.log('Using enhanced text search for query:', query);
    
    // Split query into keywords
    const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Search in both content and titles
    const textResults = await this.prisma.vector.findMany({
      where: {
        ownerId: userId,
        OR: [
          // Exact phrase match (highest priority)
          {
            chunkContent: {
              contains: query,
              mode: 'insensitive' as const, // Fix: explicit const assertion
            },
          },
          // Title match
          {
            note: {
              title: {
                contains: query,
                mode: 'insensitive' as const, // Fix: explicit const assertion
              },
            },
          },
          // Individual keyword matches
          ...keywords.map(keyword => ({
            chunkContent: {
              contains: keyword,
              mode: 'insensitive' as const, // Fix: explicit const assertion
            },
          })),
        ],
      },
      include: {
        note: {
          select: { 
            title: true,
            id: true,
          },
        },
      },
      take: limit * 2, // Get more results to filter
      orderBy: { createdAt: 'desc' },
    });

    // Calculate relevance score based on keyword matches
    const scoredResults = textResults.map((result) => {
      const content = result.chunkContent.toLowerCase();
      const title = result.note.title.toLowerCase();
      
      let score = 0;
      
      // Exact phrase match gets highest score
      if (content.includes(query.toLowerCase())) {
        score += 10;
      }
      
      // Title match gets high score
      if (title.includes(query.toLowerCase())) {
        score += 8;
      }
      
      // Keyword matches
      keywords.forEach(keyword => {
        if (content.includes(keyword)) score += 2;
        if (title.includes(keyword)) score += 3;
      });
      
      // Boost score for shorter, more relevant chunks
      if (result.chunkContent.length < 500) score += 1;
      
      return {
        id: result.id,
        noteId: result.noteId,
        chunkId: result.chunkId,
        chunkContent: result.chunkContent,
        chunkIndex: result.chunkIndex,
        heading: result.heading,
        embedding: result.embedding,
        ownerId: result.ownerId,
        createdAt: result.createdAt,
        noteTitle: result.note.title,
        similarity: Math.min(score / 10, 1.0), // Normalize to 0-1
      };
    });

    // Sort by relevance and return top results
    return scoredResults
      .filter(result => result.similarity > 0.1) // Filter out very low relevance
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async buildChatContext(query: string, userId: string, maxTokens: number = 3000) {
    // Get relevant chunks via text search
    const relevantChunks = await this.semanticSearch(query, userId, 10);

    let context = '';
    const citations: { title: string; heading?: string }[] = [];
    let tokenCount = 0;

    if (this.geminiApiKey) {
      console.log(`📚 Found ${relevantChunks.length} relevant chunks for context (Gemini API available)`);
    } else {
      console.log(`📚 Found ${relevantChunks.length} relevant chunks for context`);
    }

    if (relevantChunks.length === 0) {
      console.log('ℹ️ No relevant content found, will use general system prompt');
      return { context: '', citations: [] };
    }

    for (const chunk of relevantChunks) {
      const chunkTokens = this.estimateTokens(chunk.chunkContent);

      if (tokenCount + chunkTokens > maxTokens) {
        console.log(`📝 Context limit reached at ${tokenCount} tokens`);
        break;
      }

      context += `--- ${chunk.noteTitle}${chunk.heading ? ` > ${chunk.heading}` : ''} ---\n`;
      context += chunk.chunkContent + '\n\n';

      citations.push({
        title: chunk.noteTitle,
        heading: chunk.heading || undefined,
      });

      tokenCount += chunkTokens + 20; // +20 for separator tokens
      console.log(`📄 Added chunk from "${chunk.noteTitle}" (${chunkTokens} tokens)`);
    }

    if (this.geminiApiKey) {
      console.log(`✅ Built context with ${tokenCount} tokens and ${citations.length} citations (optimized for Gemini)`);
    } else {
      console.log(`✅ Built context with ${tokenCount} tokens and ${citations.length} citations`);
    }
    return { context, citations };
  }

  private chunkText(content: string, noteId: string, options = { maxTokens: 400, overlap: 30 }): TextChunk[] {
    const chunks: TextChunk[] = [];
    const lines = content.split('\n');

    let currentChunk = '';
    let currentHeading = '';
    let chunkIndex = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detect markdown headings
      if (trimmedLine.startsWith('#')) {
        // If we have a current chunk, save it before starting new one
        if (currentChunk.trim()) {
          chunks.push({
            id: `${noteId}_chunk_${chunkIndex}`,
            content: currentChunk.trim(),
            index: chunkIndex,
            heading: currentHeading || undefined,
          });
          chunkIndex++;
          currentChunk = '';
        }

        currentHeading = trimmedLine.replace(/^#+\s*/, '');
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';

        // Check if chunk is getting too large
        if (this.estimateTokens(currentChunk) > options.maxTokens) {
          // Try to split at sentence boundary
          const sentences = currentChunk.split(/[.!?]+/);
          if (sentences.length > 1) {
            const splitPoint = Math.floor(sentences.length / 2);
            const firstPart = sentences.slice(0, splitPoint).join('.') + '.';
            const secondPart = sentences.slice(splitPoint).join('.');

            chunks.push({
              id: `${noteId}_chunk_${chunkIndex}`,
              content: firstPart.trim(),
              index: chunkIndex,
              heading: currentHeading || undefined,
            });
            chunkIndex++;

            // Add overlap
            const overlapWords = firstPart.split(' ').slice(-options.overlap).join(' ');
            currentChunk = overlapWords + ' ' + secondPart;
          } else {
            // Force split if no sentence boundaries
            chunks.push({
              id: `${noteId}_chunk_${chunkIndex}`,
              content: currentChunk.trim(),
              index: chunkIndex,
              heading: currentHeading || undefined,
            });
            chunkIndex++;
            currentChunk = '';
          }
        }
      }
    }

    // Add remaining chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `${noteId}_chunk_${chunkIndex}`,
        content: currentChunk.trim(),
        index: chunkIndex,
        heading: currentHeading || undefined,
      });
    }

    return chunks.filter((chunk) => chunk.content.length > 20);
  }

  private async embedChunks(chunks: TextChunk[]): Promise<EmbeddedChunk[]> {
    if (chunks.length === 0) return [];

    // Prefer text search when Gemini is available
    if (this.geminiApiKey) {
      console.log('Gemini API available - using text search instead of embeddings');
      return chunks.map((chunk) => ({
        ...chunk,
        embedding: [], // Empty embedding array
      }));
    }

    if (!this.useEmbeddings || !this.openai) {
      console.log('Embeddings disabled, returning chunks without embeddings');
      return chunks.map((chunk) => ({
        ...chunk,
        embedding: [], // Empty embedding array
      }));
    }

    try {
      console.log(`Generating OpenAI embeddings for ${chunks.length} chunks...`);
      const contents = chunks.map((chunk) => chunk.content);

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: contents,
      });

      const embeddings = response.data.map((item) => item.embedding);
      console.log('✅ Generated OpenAI embeddings successfully');

      return chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index],
      }));
    } catch (error) {
      console.error('❌ Error generating OpenAI embeddings:', error.message);
      
      if (error.code === 'insufficient_quota' || error.status === 429) {
        console.log('💡 Suggestion: Use Google Gemini (free) by setting GOOGLE_GEMINI_API_KEY');
      }
      
      // Disable embeddings for future requests
      this.useEmbeddings = false;
      
      // Return chunks without embeddings
      return chunks.map((chunk) => ({
        ...chunk,
        embedding: [],
      }));
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  public async updateUsage(userId: string, date: string, embeddingTokens: number, chatTokens: number) {
    // Only track usage if we actually used tokens
    if (embeddingTokens === 0 && chatTokens === 0) return;
    
    try {
      const existing = await this.prisma.usage.findUnique({
        where: {
          ownerId_date: {
            ownerId: userId,
            date,
          },
        },
      });

      if (existing) {
        await this.prisma.usage.update({
          where: { id: existing.id },
          data: {
            embeddingTokens: existing.embeddingTokens + embeddingTokens,
            chatTokens: existing.chatTokens + chatTokens,
          },
        });
      } else {
        await this.prisma.usage.create({
          data: {
            ownerId: userId,
            date,
            embeddingTokens,
            chatTokens,
          },
        });
      }
    } catch (error) {
      console.error('Error updating usage:', error);
      // Don't throw error to avoid disrupting main flow
    }
  }
}
