import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategorySuggestionDto } from './dto/categories.dto';
import * as natural from 'natural';
// Fix compromise import with proper ES module interop
import nlp from 'compromise';

@Injectable()
export class CategoriesService {
  private tokenizer = new natural.WordTokenizer();
  private stemmer = natural.PorterStemmer;

  constructor(
    private prisma: PrismaService,
    @InjectQueue('smart-categorization') private categorizationQueue: Queue,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        ownerId: userId,
      },
      include: {
        noteCategories: {
          include: {
            note: {
              select: { id: true, title: true },
            },
          },
        },
        _count: {
          select: { noteCategories: true },
        },
      },
    });
  }

  async findAll(userId: string, includeAuto: boolean = true) {
    const where = {
      ownerId: userId,
      ...(includeAuto ? {} : { isAuto: false }),
    };

    return this.prisma.category.findMany({
      where,
      include: {
        noteCategories: {
          include: {
            note: {
              select: { id: true, title: true },
            },
          },
        },
        _count: {
          select: { noteCategories: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, ownerId: userId },
      include: {
        noteCategories: {
          include: {
            note: {
              select: { id: true, title: true, content: true },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string) {
    await this.findOne(id, userId);
    
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        _count: {
          select: { noteCategories: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    
    // Remove all note-category associations first
    await this.prisma.noteCategory.deleteMany({
      where: { categoryId: id },
    });
    
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async suggestCategories(content: string, userId: string): Promise<CategorySuggestionDto[]> {
    console.log(`🔍 Suggesting categories for content: "${content}" (userId: ${userId})`);
    
    const userCategories = await this.prisma.category.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, keywords: true },
    });

    console.log(`📁 Found ${userCategories.length} existing categories for user`);

    if (userCategories.length === 0) {
      console.log(`💡 No existing categories, generating new suggestions...`);
      const suggestions = await this.generateNewCategorySuggestions(content);
      console.log(`✨ Generated ${suggestions.length} new category suggestions:`, suggestions.map(s => `${s.name}(${s.confidence})`));
      return suggestions;
    }

    const suggestions: CategorySuggestionDto[] = [];
    const processedContent = this.preprocessText(content);
    console.log(`🔄 Processed content: "${processedContent}"`);

    for (const category of userCategories) {
      const confidence = this.calculateCategoryConfidence(processedContent, category.keywords);
      console.log(`📊 Category "${category.name}" confidence: ${confidence} (keywords: ${category.keywords})`);
      
      if (confidence > 0.3) {
        const matchingKeywords = category.keywords.filter(keyword =>
          processedContent.toLowerCase().includes(keyword.toLowerCase())
        );

        suggestions.push({
          name: category.name,
          confidence,
          matchingKeywords,
          exists: true,
          existingCategoryId: category.id,
        });
      }
    }

    // Add AI-generated suggestions if confidence is low
    if (suggestions.length === 0 || Math.max(...suggestions.map(s => s.confidence)) < 0.6) {
      console.log(`🤖 Low confidence or no matches, adding AI suggestions...`);
      const aiSuggestions = await this.generateNewCategorySuggestions(content);
      console.log(`✨ AI suggestions:`, aiSuggestions.map(s => `${s.name}(${s.confidence})`));
      suggestions.push(...aiSuggestions);
    }

    const finalSuggestions = suggestions.sort((a, b) => b.confidence - a.confidence);
    console.log(`🎯 Final suggestions:`, finalSuggestions.map(s => `${s.name}(${s.confidence})`));
    
    return finalSuggestions;
  }

  async autoCategorizeNote(noteId: string, userId: string, threshold: number = 0.5) { // Giảm threshold mặc định
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    console.log(`🎯 Auto-categorizing note: "${note.title}" with content: "${note.content.substring(0, 100)}..." (threshold: ${threshold})`);

    const suggestions = await this.suggestCategories(note.content + ' ' + note.title, userId);
    const applicableSuggestions = suggestions.filter(s => s.confidence >= threshold);

    console.log(`📝 Found ${suggestions.length} suggestions, ${applicableSuggestions.length} applicable (>= ${threshold})`);

    const results = [];

    for (const suggestion of applicableSuggestions) {
      if (suggestion.exists && suggestion.existingCategoryId) {
        // Assign to existing category
        try {
          await this.prisma.noteCategory.create({
            data: {
              noteId,
              categoryId: suggestion.existingCategoryId,
              confidence: suggestion.confidence,
              isAuto: true,
            },
          });
          results.push({ ...suggestion, assigned: true });
          console.log(`✅ Assigned existing category: ${suggestion.name} (confidence: ${suggestion.confidence})`);
        } catch (error) {
          console.log(`⚠️ Category already assigned: ${suggestion.name}`);
          results.push({ ...suggestion, assigned: false, reason: 'Already assigned' });
        }
      } else if (suggestion.confidence >= 0.7) { // Giữ threshold cao cho tạo category mới
        // Create new category for high-confidence suggestions
        const newCategory = await this.prisma.category.create({
          data: {
            name: suggestion.name,
            keywords: suggestion.matchingKeywords,
            ownerId: userId,
            isAuto: true,
            confidence: suggestion.confidence,
          },
        });

        await this.prisma.noteCategory.create({
          data: {
            noteId,
            categoryId: newCategory.id,
            confidence: suggestion.confidence,
            isAuto: true,
          },
        });

        results.push({ ...suggestion, assigned: true, categoryId: newCategory.id });
        console.log(`✅ Created and assigned new category: ${suggestion.name} (confidence: ${suggestion.confidence})`);
      } else {
        console.log(`💭 Suggestion "${suggestion.name}" below creation threshold (${suggestion.confidence} < 0.7)`);
        results.push({ ...suggestion, assigned: false, reason: 'Below creation threshold' });
      }
    }

    return results;
  }

  async queueAutoCategorization(noteId: string, userId: string, threshold?: number) {
    await this.categorizationQueue.add(
      'auto-categorize-note',
      { noteId, userId, threshold: threshold || 0.5 }, // Giảm threshold từ 0.7 xuống 0.5
      {
        delay: 2000, // 2 second delay to allow note to be fully processed
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  async getNoteCategories(noteId: string, userId: string) {
    return this.prisma.noteCategory.findMany({
      where: {
        noteId,
        note: { ownerId: userId },
      },
      include: {
        category: true,
      },
      orderBy: { confidence: 'desc' },
    });
  }

  async assignCategory(noteId: string, categoryId: string, userId: string) {
    // Verify note ownership
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Verify category ownership
    const category = await this.findOne(categoryId, userId);

    try {
      return await this.prisma.noteCategory.create({
        data: {
          noteId,
          categoryId,
          isAuto: false,
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Note is already assigned to this category');
      }
      throw error;
    }
  }

  async unassignCategory(noteId: string, categoryId: string, userId: string) {
    // Verify note ownership
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.prisma.noteCategory.delete({
      where: {
        noteId_categoryId: {
          noteId,
          categoryId,
        },
      },
    });
  }

  private preprocessText(text: string): string {
    // Remove markdown formatting
    let processed = text
      .replace(/[#*_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();

    try {
      // Extract meaningful phrases using compromise with proper error handling
      if (nlp && typeof nlp === 'function') {
        const doc = nlp(processed);
        const nouns = doc.nouns().out('array') || [];
        const topics = doc.topics().out('array') || [];
        
        processed += ' ' + [...nouns, ...topics].join(' ');
      } else {
        console.warn('Compromise.js not properly loaded, using basic text processing');
      }
    } catch (error) {
      console.warn('Compromise.js processing failed, using basic text processing:', error.message);
      // Fallback to basic processing without compromise
    }

    return processed;
  }

  private calculateCategoryConfidence(content: string, keywords: string[]): number {
    if (keywords.length === 0) {
      return 0;
    }

    const contentLower = content.toLowerCase();
    const tokens = this.tokenizer.tokenize(contentLower) || [];
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));

    let score = 0;
    let keywordMatches = 0;

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const keywordTokens = this.tokenizer.tokenize(keywordLower) || [];
      const stemmedKeyword = keywordTokens.map(token => this.stemmer.stem(token));

      // Exact phrase match (highest score)
      if (contentLower.includes(keywordLower)) {
        score += 3.0;
        keywordMatches++;
      }
      // Vietnamese-specific matching improvements
      else if (this.matchVietnameseVariations(keywordLower, contentLower)) {
        score += 2.8; // High score for Vietnamese variations
        keywordMatches++;
      }
      // Partial word match (cho từ ghép như "xuongrong" vs "xương rồng")
      else if (keywordLower.replace(/\s+/g, '').length > 3 && 
               contentLower.includes(keywordLower.replace(/\s+/g, ''))) {
        score += 2.5;
        keywordMatches++;
      }
      // Stemmed word match
      else if (stemmedKeyword.some(stem => stemmedTokens.includes(stem))) {
        score += 1.5;
        keywordMatches++;
      }
      // Fuzzy match using natural distance
      else if (tokens.length > 0) {
        const distances = tokens.map(token => 
          natural.JaroWinklerDistance(token, keywordLower, { dj: 0.8 })
        );
        const bestMatch = distances.length > 0 ? Math.max(...distances) : 0;
        if (bestMatch > 0.8) {
          score += bestMatch;
          keywordMatches++;
        }
      }
    }

    // Normalize score với điểm số cao hơn
    const maxScore = keywords.length * 3.0;
    const confidence = Math.min(score / maxScore, 1.0);

    // Boost confidence if multiple keywords match
    const keywordMatchRatio = keywordMatches / keywords.length;
    const finalConfidence = confidence * (0.6 + (keywordMatchRatio * 0.4));

    console.log(`🔍 Keyword analysis for "${keywords.join(', ')}":`, {
      keywordMatches,
      totalKeywords: keywords.length,
      rawScore: score,
      maxScore,
      baseConfidence: confidence,
      finalConfidence,
      matchRatio: keywordMatchRatio
    });

    return finalConfidence;
  }

  // Enhanced method for Vietnamese-specific matching
  private matchVietnameseVariations(keyword: string, content: string): boolean {
    const keywordLower = keyword.toLowerCase();
    const contentLower = content.toLowerCase();

    // 1. Remove spaces and check concatenated version
    const keywordNoSpace = keywordLower.replace(/\s+/g, '');
    const contentNoSpace = contentLower.replace(/\s+/g, '');
    if (contentNoSpace.includes(keywordNoSpace) || keywordNoSpace.includes(contentLower.replace(/\s+/g, ''))) {
      return true;
    }

    // 2. Vietnamese diacritics normalization
    const normalizedKeyword = this.normalizeVietnamese(keywordLower);
    const normalizedContent = this.normalizeVietnamese(contentLower);
    if (normalizedContent.includes(normalizedKeyword)) {
      return true;
    }

    // 3. Check word parts matching (for compound words)
    const keywordParts = keywordLower.split(/\s+/);
    const contentWords = contentLower.split(/\s+/);
    
    // If keyword has multiple parts, check if all parts exist in content
    if (keywordParts.length > 1) {
      const allPartsFound = keywordParts.every(part => 
        part.length > 2 && contentWords.some(word => 
          word.includes(part) || part.includes(word)
        )
      );
      if (allPartsFound) return true;
    }

    // 4. Reverse matching - check if content words are contained in keyword
    const longContentWords = contentWords.filter(word => word.length > 3);
    for (const word of longContentWords) {
      if (keywordLower.includes(word) && word.length >= keywordLower.length * 0.6) {
        return true;
      }
    }

    // 5. Phonetic similarity for Vietnamese words
    if (this.isVietnamesePhoneticSimilar(keywordLower, contentLower)) {
      return true;
    }

    return false;
  }

  private normalizeVietnamese(text: string): string {
    // Vietnamese diacritics removal mapping
    const vietnameseMap = {
      'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ': 'a',
      'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ': 'e',
      'ì|í|ị|ỉ|ĩ': 'i',
      'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ': 'o',
      'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ': 'u',
      'ỳ|ý|ỵ|ỷ|ỹ': 'y',
      'đ': 'd',
      'À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ': 'A',
      'È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ': 'E',
      'Ì|Í|Ị|Ỉ|Ĩ': 'I',
      'Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ': 'O',
      'Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ': 'U',
      'Ỳ|Ý|Ỵ|Ỷ|Ỹ': 'Y',
      'Đ': 'D'
    };

    let normalized = text;
    for (const [accented, plain] of Object.entries(vietnameseMap)) {
      const regex = new RegExp(accented, 'g');
      normalized = normalized.replace(regex, plain);
    }

    return normalized;
  }

  private isVietnamesePhoneticSimilar(keyword: string, content: string): boolean {
    // Common Vietnamese phonetic substitutions
    const phoneticMap = new Map([
      // Similar consonants
      ['ph', 'f'], ['th', 't'], ['kh', 'k'], ['gh', 'g'], ['nh', 'n'],
      ['ch', 'c'], ['tr', 't'], ['qu', 'q'], ['gi', 'g'], ['ngh', 'ng'],
      // Vowel variations  
      ['ă', 'a'], ['â', 'a'], ['ê', 'e'], ['ô', 'o'], ['ơ', 'o'], ['ư', 'u'],
      // Common variations
      ['tion', 'sion'], ['c', 'k'], ['y', 'i']
    ]);

    let normalizedKeyword = keyword;
    let normalizedContent = content;

    // Apply phonetic transformations - Fix: use phoneticMap.entries() instead of Map.entries(phoneticMap)
    for (const [from, to] of phoneticMap.entries()) {
      const regex = new RegExp(from, 'g');
      normalizedKeyword = normalizedKeyword.replace(regex, to);
      normalizedContent = normalizedContent.replace(regex, to);
    }

    // Check if normalized versions match
    return normalizedContent.includes(normalizedKeyword) || 
           normalizedKeyword.includes(normalizedContent);
  }

  private async generateNewCategorySuggestions(content: string): Promise<CategorySuggestionDto[]> {
    const suggestions: CategorySuggestionDto[] = [];
    
    // Basic keyword extraction as fallback
    let nouns: string[] = [];
    let topics: string[] = [];
    let people: string[] = [];
    let places: string[] = [];

    try {
      // Extract key topics and themes from content using compromise
      if (nlp && typeof nlp === 'function') {
        const doc = nlp(content);
        nouns = doc.nouns().out('array') || [];
        topics = doc.topics().out('array') || [];
        people = doc.people().out('array') || [];
        places = doc.places().out('array') || [];
      } else {
        throw new Error('Compromise.js not available');
      }
    } catch (error) {
      console.warn('Compromise.js failed, using basic keyword extraction:', error.message);
      
      // Enhanced fallback to simple word extraction with better filtering
      const words = content.toLowerCase().split(/\s+/);
      const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those']);
      
      topics = words.filter(word => 
        word.length > 4 && 
        !stopWords.has(word) &&
        /^[a-zA-Z]+$/.test(word) // Only alphabetic characters
      ).slice(0, 8); // Get more keywords for better categorization
    }

    // Technology/Programming keywords
    const techKeywords = ['code', 'programming', 'development', 'software', 'api', 'database', 'algorithm', 'javascript', 'python', 'react', 'nodejs', 'html', 'css', 'git', 'github', 'docker', 'aws', 'cloud'];
    const techMatches = techKeywords.filter(k => content.toLowerCase().includes(k));
    if (techMatches.length > 0) {
      suggestions.push({
        name: 'Technology',
        confidence: Math.min(0.9, 0.6 + (techMatches.length * 0.1)),
        matchingKeywords: techMatches,
        exists: false,
      });
    }

    // Business/Work keywords
    const businessKeywords = ['meeting', 'project', 'business', 'client', 'deadline', 'budget', 'strategy', 'team', 'manager', 'report', 'presentation', 'office', 'work', 'job', 'career'];
    const businessMatches = businessKeywords.filter(k => content.toLowerCase().includes(k));
    if (businessMatches.length > 0) {
      suggestions.push({
        name: 'Work',
        confidence: Math.min(0.9, 0.6 + (businessMatches.length * 0.1)),
        matchingKeywords: businessMatches,
        exists: false,
      });
    }

    // Personal/Life keywords
    const personalKeywords = ['family', 'friend', 'personal', 'life', 'health', 'hobby', 'travel', 'vacation', 'home', 'relationship', 'birthday', 'celebration'];
    const personalMatches = personalKeywords.filter(k => content.toLowerCase().includes(k));
    if (personalMatches.length > 0) {
      suggestions.push({
        name: 'Personal',
        confidence: Math.min(0.8, 0.5 + (personalMatches.length * 0.1)),
        matchingKeywords: personalMatches,
        exists: false,
      });
    }

    // Learning/Education keywords
    const learningKeywords = ['learn', 'study', 'course', 'tutorial', 'book', 'research', 'knowledge', 'education', 'school', 'university', 'lesson', 'training', 'skill'];
    const learningMatches = learningKeywords.filter(k => content.toLowerCase().includes(k));
    if (learningMatches.length > 0) {
      suggestions.push({
        name: 'Learning',
        confidence: Math.min(0.9, 0.6 + (learningMatches.length * 0.1)),
        matchingKeywords: learningMatches,
        exists: false,
      });
    }

    // Health & Fitness keywords
    const healthKeywords = ['health', 'fitness', 'exercise', 'workout', 'diet', 'nutrition', 'medical', 'doctor', 'hospital', 'medicine', 'wellness'];
    const healthMatches = healthKeywords.filter(k => content.toLowerCase().includes(k));
    if (healthMatches.length > 0) {
      suggestions.push({
        name: 'Health',
        confidence: Math.min(0.8, 0.6 + (healthMatches.length * 0.1)),
        matchingKeywords: healthMatches,
        exists: false,
      });
    }

    // Finance keywords
    const financeKeywords = ['money', 'budget', 'finance', 'investment', 'bank', 'loan', 'credit', 'debt', 'savings', 'expense', 'income', 'tax'];
    const financeMatches = financeKeywords.filter(k => content.toLowerCase().includes(k));
    if (financeMatches.length > 0) {
      suggestions.push({
        name: 'Finance',
        confidence: Math.min(0.8, 0.6 + (financeMatches.length * 0.1)),
        matchingKeywords: financeMatches,
        exists: false,
      });
    }

    // Cây cảnh/Gardening keywords - thêm category phù hợp với nội dung
    const gardeningKeywords = ['cây', 'trồng', 'chăm sóc', 'hoa', 'lá', 'cây cảnh', 'vườn', 'trồng trọt', 'tưới', 'phân bón', 'đất', 'hạt giống'];
    const gardeningMatches = gardeningKeywords.filter(k => content.toLowerCase().includes(k));
    if (gardeningMatches.length > 0) {
      suggestions.push({
        name: 'Cây cảnh',
        confidence: Math.min(0.9, 0.6 + (gardeningMatches.length * 0.1)),
        matchingKeywords: gardeningMatches,
        exists: false,
      });
    }

    // Phong thủy keywords
    const fengShuiKeywords = ['phong thủy', 'may mắn', 'tài lộc', 'thịnh vượng', 'hút tài', 'hóa giải'];
    const fengShuiMatches = fengShuiKeywords.filter(k => content.toLowerCase().includes(k));
    if (fengShuiMatches.length > 0) {
      suggestions.push({
        name: 'Phong thủy',
        confidence: Math.min(0.8, 0.6 + (fengShuiMatches.length * 0.1)),
        matchingKeywords: fengShuiMatches,
        exists: false,
      });
    }

    // Create category suggestions based on extracted topics
    for (const topic of topics.slice(0, 3)) {
      if (topic.length > 2 && !suggestions.some(s => s.name.toLowerCase() === topic.toLowerCase())) {
        suggestions.push({
          name: this.capitalizeFirst(topic),
          confidence: 0.4, // Lower confidence for auto-generated topics
          matchingKeywords: [topic],
          exists: false,
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
