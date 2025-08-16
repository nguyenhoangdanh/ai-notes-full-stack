import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAI } from 'openai';

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  wordCount: number;
  readingTime: number; // in minutes
  model: string;
}

@Injectable()
export class SummariesService {
  private groqApiKey: string;
  private openaiApiKey: string;
  private geminiApiKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @InjectQueue('auto-summary') private summaryQueue: Queue,
  ) {
    this.groqApiKey = configService.get('GROQ_API_KEY');
    this.openaiApiKey = configService.get('OPENAI_API_KEY');
    this.geminiApiKey = configService.get('GOOGLE_GEMINI_API_KEY');
  }

  async generateSummary(noteId: string, userId: string, options?: {
    minWords?: number;
    maxSummaryLength?: number;
    includeKeyPoints?: boolean;
    model?: string;
  }): Promise<SummaryResult> {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const minWords = options?.minWords || 100;
    const wordCount = note.content.split(/\s+/).length;

    if (wordCount < minWords) {
      throw new Error(`Note too short for summary. Minimum ${minWords} words required.`);
    }

    // Check if summary already exists and is recent
    const existingSummary = await this.prisma.autoSummary.findUnique({
      where: { noteId },
    });

    if (existingSummary && this.isSummaryRecent(existingSummary.createdAt, note.updatedAt)) {
      return {
        summary: existingSummary.summary,
        keyPoints: existingSummary.keyPoints,
        wordCount: existingSummary.wordCount,
        readingTime: Math.ceil(wordCount / 200), // 200 words per minute
        model: existingSummary.model,
      };
    }

    // Generate new summary with custom model if specified
    const summaryOptions = {
      ...options,
      model: options?.model
    };

    const summaryResult = await this.createSummary(note.content, note.title, summaryOptions);

    // Save to database
    await this.prisma.autoSummary.upsert({
      where: { noteId },
      update: {
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        wordCount: summaryResult.wordCount,
        model: summaryResult.model,
      },
      create: {
        noteId,
        ownerId: userId,
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        wordCount: summaryResult.wordCount,
        model: summaryResult.model,
      },
    });

    return summaryResult;
  }

  async generateTemplatedSummary(noteId: string, userId: string, templatePrompt: string): Promise<SummaryResult> {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const wordCount = note.content.split(/\s+/).length;
    if (wordCount < 50) {
      throw new Error('Note too short for summary generation');
    }

    const prompt = `
${templatePrompt}

Title: ${note.title}
Content: ${note.content}

Please provide:
1. A structured summary based on the template requirements
2. Key points (3-5 bullet points)

Format your response as JSON:
{
  "summary": "Your template-based summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "wordCount": ${wordCount}
}
`;

    try {
      const summaryResult = await this.createSummary(note.content, note.title, { 
        customPrompt: prompt,
        includeKeyPoints: true 
      });

      // Save as regular summary but mark template type in metadata
      await this.prisma.autoSummary.upsert({
        where: { noteId },
        update: {
          summary: summaryResult.summary,
          keyPoints: summaryResult.keyPoints,
          wordCount: summaryResult.wordCount,
          model: summaryResult.model,
        },
        create: {
          noteId,
          ownerId: userId,
          summary: summaryResult.summary,
          keyPoints: summaryResult.keyPoints,
          wordCount: summaryResult.wordCount,
          model: summaryResult.model,
        },
      });

      return summaryResult;
    } catch (error) {
      console.error('Error generating templated summary:', error);
      throw new Error(`Failed to generate templated summary: ${error.message}`);
    }
  }

  async getSummaryVersions(noteId: string, userId: string, limit: number = 10) {
    // For now, return the current summary as a single version
    // In a full implementation, you'd track version history
    const currentSummary = await this.getSummary(noteId, userId);
    
    if (!currentSummary) {
      return [];
    }

    return [{
      id: currentSummary.id,
      version: 1,
      summary: currentSummary.summary,
      keyPoints: currentSummary.keyPoints,
      wordCount: currentSummary.wordCount,
      model: currentSummary.model,
      createdAt: currentSummary.createdAt,
      isCurrent: true
    }];
  }

  async getSummary(noteId: string, userId: string) {
    const summary = await this.prisma.autoSummary.findFirst({
      where: {
        noteId,
        owner: { id: userId },
      },
      include: {
        note: {
          select: { title: true, updatedAt: true },
        },
      },
    });

    if (!summary) {
      return null;
    }

    return {
      ...summary,
      readingTime: Math.ceil(summary.wordCount / 200),
      isStale: summary.createdAt < summary.note.updatedAt,
    };
  }

  async deleteSummary(noteId: string, userId: string) {
    const summary = await this.prisma.autoSummary.findFirst({
      where: {
        noteId,
        owner: { id: userId },
      },
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    await this.prisma.autoSummary.delete({
      where: { id: summary.id },
    });
  }

  async queueSummaryGeneration(noteId: string, userId: string, options?: any) {
    const jobData = {
      noteId,
      userId,
      options: options || {}
    };

    const jobOptions = {
      attempts: 2,
      backoff: {
        type: 'exponential' as const,
        delay: 3000,
      },
      priority: 0,
      delay: 1000, // 1 second delay
    };

    const job = await this.summaryQueue.add('generate-summary', jobData, jobOptions);
    
    console.log(`Queued summary generation job ${job.id} for note ${noteId}`);
    
    return {
      jobId: job.id,
      noteId,
      userId,
      message: 'Summary generation queued successfully'
    };
  }

  async batchGenerateSummaries(userId: string, noteIds: string[], options?: {
    minWords?: number;
    skipExisting?: boolean;
  }) {
    // Validate notes belong to user
    const validNotes = await this.prisma.note.findMany({
      where: {
        id: { in: noteIds },
        ownerId: userId,
        isDeleted: false
      },
      select: { id: true, title: true, content: true }
    });

    const validNoteIds = validNotes.map(n => n.id);
    const invalidNoteIds = noteIds.filter(id => !validNoteIds.includes(id));

    if (validNoteIds.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
        message: 'No valid notes found'
      };
    }

    // For immediate processing (small batches)
    if (validNoteIds.length <= 10) {
      return this.processImmediateBatch(userId, validNoteIds, options);
    }

    // For larger batches, use queue
    const job = await this.summaryQueue.add(
      'batch-generate-summaries',
      { userId, noteIds: validNoteIds, options },
      {
        attempts: 1,
        priority: -1, // Lower priority than individual summaries
      }
    );

    return {
      jobId: job.id,
      total: validNoteIds.length,
      invalidNotes: invalidNoteIds,
      message: 'Batch summary generation queued successfully'
    };
  }

  private async processImmediateBatch(userId: string, noteIds: string[], options?: any) {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const noteId of noteIds) {
      try {
        // Check if summary exists and should be skipped
        if (options?.skipExisting) {
          const existingSummary = await this.prisma.autoSummary.findUnique({
            where: { noteId }
          });
          
          if (existingSummary) {
            results.push({
              noteId,
              success: true,
              skipped: true,
              reason: 'Summary already exists'
            });
            continue;
          }
        }

        const summary = await this.generateSummary(noteId, userId, options);
        
        results.push({
          noteId,
          success: true,
          summary: {
            wordCount: summary.wordCount,
            model: summary.model
          }
        });
        successful++;

      } catch (error) {
        console.error(`Failed to generate summary for note ${noteId}:`, error);
        results.push({
          noteId,
          success: false,
          error: error.message
        });
        failed++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      total: noteIds.length,
      successful,
      failed,
      results
    };
  }

  async queueBatchSummaries(userId: string, noteIds: string[], options?: any) {
    const job = await this.summaryQueue.add(
      'batch-generate-summaries',
      { userId, noteIds, options },
      {
        attempts: 1,
        priority: -1,
      }
    );

    return {
      jobId: job.id,
      userId,
      noteCount: noteIds.length,
      message: 'Batch summary generation queued successfully'
    };
  }

  async queueStaleSummaryUpdate(userId: string, olderThanDays: number = 30) {
    const job = await this.summaryQueue.add(
      'update-stale-summaries',
      { userId, olderThanDays },
      {
        attempts: 1,
        priority: 1, // Higher priority for maintenance
      }
    );

    return {
      jobId: job.id,
      message: 'Stale summary update queued successfully'
    };
  }

  async queueCleanupOldSummaries(userId: string, olderThanDays: number = 90) {
    const job = await this.summaryQueue.add(
      'cleanup-old-summaries',
      { userId, olderThanDays },
      {
        attempts: 1,
        priority: -2, // Lowest priority
      }
    );

    return {
      jobId: job.id,
      message: 'Old summary cleanup queued successfully'
    };
  }

  async queueModelMigration(userId: string, newModel: string, noteIds?: string[]) {
    const job = await this.summaryQueue.add(
      'regenerate-with-new-model',
      { userId, newModel, noteIds },
      {
        attempts: 1,
        priority: 0,
      }
    );

    return {
      jobId: job.id,
      newModel,
      message: 'Model migration queued successfully'
    };
  }

  private async createSummary(
    content: string,
    title: string,
    options: {
      maxSummaryLength?: number;
      includeKeyPoints?: boolean;
      customPrompt?: string;
      model?: string;
    } = {}
  ): Promise<SummaryResult> {
    const maxLength = options.maxSummaryLength || 300;
    const includeKeyPoints = options.includeKeyPoints !== false;
    const customPrompt = options.customPrompt;
    const preferredModel = options.model;

    let prompt = customPrompt;
    
    if (!customPrompt) {
      prompt = `
Analyze the following note and create a comprehensive summary:

Title: ${title}

Content: ${content}

Please provide:
1. A concise summary (max ${maxLength} words)
${includeKeyPoints ? '2. Key points (3-5 bullet points)' : ''}

Format your response as JSON:
{
  "summary": "Your concise summary here",
  ${includeKeyPoints ? '"keyPoints": ["Point 1", "Point 2", "Point 3"],' : '"keyPoints": [],'}
  "wordCount": ${content.split(/\s+/).length}
}

Requirements:
- Summary should capture the main ideas and important details
- Use clear, professional language
- Focus on actionable insights and key information
- Maintain the original context and meaning
`;
    }

    try {
      let response: string;
      let model: string;

      // Use preferred model if specified and available
      if (preferredModel) {
        if (preferredModel.includes('gemini') && this.geminiApiKey) {
          response = await this.generateWithGemini(prompt);
          model = preferredModel;
        } else if (preferredModel.includes('llama') && this.groqApiKey) {
          response = await this.generateWithGroq(prompt);
          model = preferredModel;
        } else if (preferredModel.startsWith('gpt-') && this.openaiApiKey) {
          response = await this.generateWithOpenAI(prompt);
          model = preferredModel;
        } else {
          // Fallback to available providers
          if (this.geminiApiKey) {
            response = await this.generateWithGemini(prompt);
            model = 'gemini-1.5-flash';
          } else if (this.groqApiKey) {
            response = await this.generateWithGroq(prompt);
            model = 'llama3-8b-8192';
          } else if (this.openaiApiKey) {
            response = await this.generateWithOpenAI(prompt);
            model = 'gpt-3.5-turbo';
          } else {
            throw new Error('No AI API key configured');
          }
        }
      } else {
        // Use default provider selection
        if (this.geminiApiKey) {
          response = await this.generateWithGemini(prompt);
          model = 'gemini-1.5-flash';
        } else if (this.groqApiKey) {
          response = await this.generateWithGroq(prompt);
          model = 'llama3-8b-8192';
        } else if (this.openaiApiKey) {
          response = await this.generateWithOpenAI(prompt);
          model = 'gpt-3.5-turbo';
        } else {
          throw new Error('No AI API key configured');
        }
      }

      // Parse JSON response
      const parsed = JSON.parse(response);
      
      return {
        summary: parsed.summary || 'Summary generation failed',
        keyPoints: parsed.keyPoints || [],
        wordCount: parsed.wordCount || content.split(/\s+/).length,
        readingTime: Math.ceil(content.split(/\s+/).length / 200),
        model,
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Fallback to extractive summary
      return this.createExtractiveSummary(content, title);
    }
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      }),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async generateWithGroq(prompt: string): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async generateWithOpenAI(prompt: string): Promise<string> {
    const openai = new OpenAI({ apiKey: this.openaiApiKey });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || '';
  }

  private createExtractiveSummary(content: string, title: string): SummaryResult {
    // Simple extractive summary as fallback
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const topSentences = sentences.slice(0, 3).map(s => s.trim()).join('. ');
    
    return {
      summary: topSentences || 'Unable to generate summary',
      keyPoints: sentences.slice(0, 5).map(s => s.trim()),
      wordCount: content.split(/\s+/).length,
      readingTime: Math.ceil(content.split(/\s+/).length / 200),
      model: 'extractive',
    };
  }

  private isSummaryRecent(summaryCreated: Date, noteUpdated: Date): boolean {
    // Consider summary recent if it was created after the note was last updated
    return summaryCreated >= noteUpdated;
  }
}
