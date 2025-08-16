import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VectorsService } from '../vectors/vectors.service';
import { SettingsService } from '../settings/settings.service';
import { OpenAI } from 'openai';

@Injectable()
export class ChatService {
  private openaiApiKey: string;
  private geminiApiKey: string;

  constructor(
    private configService: ConfigService,
    private vectorsService: VectorsService,
    private settingsService: SettingsService,
  ) {
    this.openaiApiKey = configService.get('OPENAI_API_KEY');
    this.geminiApiKey = configService.get('GOOGLE_GEMINI_API_KEY');
    
    if (this.geminiApiKey) {
      console.log('✅ Google Gemini API key configured (Free tier available)');
    } else if (this.openaiApiKey) {
      console.log('✅ OpenAI API key configured');
    } else {
      console.log('⚠️ No AI API key configured');
    }
  }

  async streamResponse(query: string, userId: string) {
    try {
      const settings = await this.settingsService.findByUserId(userId);
      let model = settings?.model || 'gemini-1.5-flash';
      const maxTokens = settings?.maxTokens || 4000;

      console.log('Chat stream request:', { query, userId, model });

      if (model.startsWith('gpt-') && !this.openaiApiKey) {
        model = 'gemini-1.5-flash';
        console.log('Switching to Gemini due to missing OpenAI key');
      }

      const { context, citations } = await this.vectorsService.buildChatContext(
        query,
        userId,
        Math.floor(maxTokens * 0.7),
      );

      const systemPrompt = this.buildSystemPrompt();
      const fullPrompt = context.trim()
        ? `${systemPrompt}\n\nContext from your notes:\n${context}\n\nUser question: ${query}\n\nPlease answer based on the context provided above.`
        : `${systemPrompt}\n\nNo relevant context was found in your notes for this query: "${query}"\n\nPlease inform the user that you couldn't find this information in their notes and suggest they might want to add relevant notes on this topic.`;

      console.log('Full prompt length:', fullPrompt.length);
      console.log('Citations found:', citations.length);

      if (this.geminiApiKey && (model.includes('gemini') || model.startsWith('gpt-'))) {
        const geminiModel = model.startsWith('gpt-') ? 'gemini-1.5-flash' : model;
        console.log(`Using Gemini model: ${geminiModel}`);
        return await this.streamWithGemini(fullPrompt, geminiModel, citations);
      }  else if (this.openaiApiKey && model.startsWith('gpt-')) {
        return await this.streamWithOpenAI(fullPrompt, model, maxTokens, citations);
      } else {
        if (this.geminiApiKey) {
          console.log('Falling back to Gemini');
          return await this.streamWithGemini(fullPrompt, 'gemini-1.5-flash', citations);
        }  else {
          return this.createFallbackStream('No AI API key configured. Please add GOOGLE_GEMINI_API_KEY (free), GROQ_API_KEY (free), or OPENAI_API_KEY to environment variables.', citations);
        }
      }
    } catch (error) {
      console.error('Error in streamResponse:', error);
      
      if (error.code === 'insufficient_quota' || error.status === 429) {
        console.log('OpenAI quota exceeded, trying free alternatives...');
        
        if (this.geminiApiKey) {
          try {
            console.log('Switching to Gemini due to OpenAI quota exceeded');
            const { context, citations } = await this.vectorsService.buildChatContext(query, userId, 3000);
            const systemPrompt = this.buildSystemPrompt();
            const fullPrompt = context.trim()
              ? `${systemPrompt}\n\nContext from your notes:\n${context}\n\nUser question: ${query}\n\nPlease answer based on the context provided above.`
              : `${systemPrompt}\n\nNo relevant context was found in your notes for this query: "${query}"\n\nPlease inform the user that you couldn't find this information in their notes and suggest they might want to add relevant notes on this topic.`;
            
            return await this.streamWithGemini(fullPrompt, 'gemini-1.5-flash', citations);
          } catch (geminiError) {
            console.error('Gemini also failed:', geminiError);
          }
        }
        
        const fallbackMessage = 'OpenAI quota exceeded. Google Gemini configured but also failed. Please check your API keys or try again later.';
        return this.createFallbackStream(fallbackMessage, []);
      }
      
      const fallbackMessage = 'Sorry, I encountered an error while processing your request. Please try again later.';
      return this.createFallbackStream(fallbackMessage, []);
    }
  }

  private async streamWithGemini(prompt: string, model: string, citations: any[]) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 10
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);

    const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
    const stream = {
      async *[Symbol.asyncIterator]() {
        const words = fullText.split(' ');
        
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ');
          const content = i + 3 >= words.length ? chunk : chunk + ' ';
          
          yield {
            choices: [{
              delta: { content }
            }]
          };
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    };

    return { stream, citations };
  }


  private async streamWithOpenAI(prompt: string, model: string, maxTokens: number, citations: any[]) {
    const openai = new OpenAI({ apiKey: this.openaiApiKey });

    const stream = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: Math.floor(maxTokens * 0.3),
      temperature: 0.7,
      stream: true,
    });

    return { stream, citations };
  }

  async completeResponse(query: string, userId: string) {
    try {
      const settings = await this.settingsService.findByUserId(userId);
      let model = settings?.model || 'gemini-1.5-flash';
      const maxTokens = settings?.maxTokens || 4000;

      if (model.startsWith('gpt-') && !this.openaiApiKey) {
        model = 'gemini-1.5-flash';
      }

      const { context, citations } = await this.vectorsService.buildChatContext(
        query,
        userId,
        Math.floor(maxTokens * 0.7),
      );

      const systemPrompt = this.buildSystemPrompt();
      const fullPrompt = context.trim()
        ? `${systemPrompt}\n\nContext from your notes:\n${context}\n\nUser question: ${query}\n\nPlease answer based on the context provided above.`
        : `${systemPrompt}\n\nNo relevant context was found in your notes for this query: "${query}"\n\nPlease inform the user that you couldn't find this information in their notes and suggest they might want to add relevant notes on this topic.`;

      if (this.geminiApiKey && (model.includes('gemini') || model.startsWith('gpt-'))) {
        const geminiModel = model.startsWith('gpt-') ? 'gemini-1.5-flash' : model;
        return await this.completeWithGemini(fullPrompt, geminiModel, citations);
      }  else if (this.openaiApiKey && model.startsWith('gpt-')) {
        return await this.completeWithOpenAI(fullPrompt, model, maxTokens, citations, userId);
      } else {
        if (this.geminiApiKey) {
          return await this.completeWithGemini(fullPrompt, 'gemini-1.5-flash', citations);
        } else {
          return {
            response: 'No AI API key configured. Please add GOOGLE_GEMINI_API_KEY (free) or OPENAI_API_KEY to environment variables.',
            citations: [],
          };
        }
      }
    } catch (error) {
      console.error('Error in completeResponse:', error);
      
      if (error.code === 'insufficient_quota' || error.status === 429) {
        if (this.geminiApiKey) {
          try {
            const { context, citations } = await this.vectorsService.buildChatContext(query, userId, 3000);
            const systemPrompt = this.buildSystemPrompt();
            const fullPrompt = context.trim()
              ? `${systemPrompt}\n\nContext from your notes:\n${context}\n\nUser question: ${query}\n\nPlease answer based on the context provided above.`
              : `${systemPrompt}\n\nNo relevant context was found in your notes for this query: "${query}"\n\nPlease inform the user that you couldn't find this information in their notes and suggest they might want to add relevant notes on this topic.`;
            
            return await this.completeWithGemini(fullPrompt, 'gemini-1.5-flash', citations);
          } catch (geminiError) {
            console.error('Gemini fallback failed:', geminiError);
          }
        }
        
        return {
          response: 'AI quota exceeded. Please try switching to Google Gemini (free) in Settings.',
          citations: [],
        };
      }
      
      return {
        response: 'Sorry, I encountered an error while processing your request. Please try again later.',
        citations: [],
      };
    }
  }

  private async completeWithGemini(prompt: string, model: string, citations: any[]) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 10
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return {
      response: responseText,
      citations,
    };
  }

  private async completeWithOpenAI(prompt: string, model: string, maxTokens: number, citations: any[], userId: string) {
    const openai = new OpenAI({ apiKey: this.openaiApiKey });

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: Math.floor(maxTokens * 0.3),
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';

    const today = new Date().toISOString().split('T')[0];
    const estimatedTokens = completion.usage?.total_tokens || Math.ceil((prompt.length + response.length) / 4);
    
    this.vectorsService.updateUsage(userId, today, 0, estimatedTokens).catch(console.error);

    return {
      response,
      citations,
    };
  }

  private createFallbackStream(message: string, citations: any[]) {
    const stream = {
      async *[Symbol.asyncIterator]() {
        const words = message.split(' ');
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' ';
          yield {
            choices: [{
              delta: { content: chunk }
            }]
          };
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    };

    return { stream, citations };
  }

  private buildSystemPrompt(): string {
    return `Bạn là trợ lý AI thông minh cho ứng dụng ghi chú cá nhân AI Notes. Nhiệm vụ của bạn là giúp người dùng tìm kiếm thông tin từ chính những ghi chú mà họ đã viết và trả lời câu hỏi dựa trên nội dung đó.

🎯 NHIỆM VỤ CHÍNH:
- Trả lời câu hỏi dựa CHÍNH XÁC trên nội dung ghi chú được cung cấp
- Tìm kiếm và tổng hợp thông tin từ nhiều ghi chú nếu cần
- Cung cấp trích dẫn rõ ràng từ các ghi chú gốc

📋 QUY TẮC QUAN TRỌNG:
1. CHỈ sử dụng thông tin có trong phần "Context from your notes" được cung cấp
2. Nếu không tìm thấy thông tin trong ghi chú, hãy nói: "Tôi không tìm thấy thông tin này trong ghi chú của bạn."
3. Luôn trích dẫn nguồn: tên ghi chú và tiêu đề phần (nếu có)
4. Khi có nhiều ghi chú liên quan, hãy tổng hợp thông tin nhưng vẫn giữ trích dẫn
5. KHÔNG bao giờ tự suy diễn hay tạo thông tin không có trong ghi chú

💡 CÁCH TRẢ LỜI TỐT:
- Sử dụng markdown để format rõ ràng
- Trả lời ngắn gọn nhưng đầy đủ
- Luôn kết thúc với phần "**Nguồn tham khảo:**" liệt kê các ghi chú đã sử dụng
- Sử dụng tiếng Việt tự nhiên, thân thiện

🔍 KHI KHÔNG TÌM THẤY THÔNG TIN:
"Tôi không tìm thấy thông tin về [chủ đề] trong ghi chú của bạn. Bạn có muốn thêm ghi chú mới về chủ đề này không?"

Hãy nhớ: Bạn là trợ lý thông minh giúp người dùng khám phá lại kiến thức từ chính những ghi chú của họ!`;
  }

  async generateSuggestion(
    content: string,
    selectedText: string,
    suggestionType: string,
    userId: string,
    targetLanguage?: string
  ) {
    const suggestions = {
      improve: `Vai trò: Bạn là editor chuyên nghiệp.
Nhiệm vụ: Cải thiện văn phong của đoạn text sau. Làm cho nó rõ ràng, mạch lạc và dễ hiểu hơn.
Yêu cầu: Chỉ trả về phiên bản đã cải thiện, không giải thích.`,

      expand: `Vai trò: Bạn là chuyên gia nội dung.
Nhiệm vụ: Mở rộng đoạn text sau bằng cách thêm chi tiết, ví dụ và giải thích sâu hơn.
Yêu cầu: Chỉ trả về phiên bản đã mở rộng, không giải thích.`,

      summarize: `Vai trò: Bạn là chuyên gia tóm tắt.
Nhiệm vụ: Tóm tắt đoạn text sau thành những ý chính quan trọng nhất.
Yêu cầu: Chỉ trả về bản tóm tắt, không giải thích.`,

      restructure: `Vai trò: Bạn là chuyên gia tổ chức thông tin.
Nhiệm vụ: Sắp xếp lại cấu trúc đoạn text sau cho logic và dễ theo dõi hơn.
Yêu cầu: Chỉ trả về phiên bản đã sắp xếp lại, không giải thích.`,

      examples: `Vai trò: Bạn là chuyên gia minh họa.
Nhiệm vụ: Thêm ví dụ cụ thể và thực tế vào đoạn text sau.
Yêu cầu: Chỉ trả về phiên bản có ví dụ, không giải thích.`,

      grammar: `Vai trò: Bạn là editor ngữ pháp.
Nhiệm vụ: Sửa lỗi chính tả, ngữ pháp trong đoạn text sau.
Yêu cầu: Chỉ trả về phiên bản đã sửa lỗi, không giải thích.`,

      translate: `Vai trò: Bạn là dịch giả chuyên nghiệp.
Nhiệm vụ: Dịch đoạn text sau sang ${targetLanguage || 'tiếng Anh'} một cách tự nhiên.
Yêu cầu: Chỉ trả về bản dịch, không giải thích.`
    };

    const targetText = selectedText || content;
    
    const systemPrompt = `${suggestions[suggestionType]}

ĐOẠN TEXT CẦN XỬ LÝ:
${targetText}

KẾT QUẢ:`;

    try {
      const result = await this.directAICall(systemPrompt);
      
      return {
        originalText: targetText,
        suggestion: result,
        type: suggestionType,
        hasSelection: !!selectedText
      };
    } catch (error) {
      console.error('Error generating suggestion:', error);
      throw new Error('Failed to generate AI suggestion');
    }
  }

  private async directAICall(prompt: string): Promise<string> {
    if (this.geminiApiKey) {
      return this.directGeminiCall(prompt);
    } else if (this.openaiApiKey) {
      return this.directOpenAICall(prompt);
    } else {
      throw new Error('No AI API key configured');
    }
  }

  private async directGeminiCall(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 40
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
  }

  private async directOpenAICall(prompt: string): Promise<string> {
    const openai = new OpenAI({ apiKey: this.openaiApiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || 'No response generated';
  }

  async applySuggestion(data: {
    noteId: string;
    originalContent: string;
    suggestion: string;
    selectedText?: string;
    applyType: 'replace' | 'append' | 'insert';
    position?: number;
  }, userId: string) {
    let newContent = data.originalContent;

    switch (data.applyType) {
      case 'replace':
        if (data.selectedText) {
          newContent = newContent.replace(data.selectedText, data.suggestion);
        } else {
          newContent = data.suggestion;
        }
        break;
      
      case 'append':
        newContent = newContent + '\n\n' + data.suggestion;
        break;
      
      case 'insert':
        const position = data.position || newContent.length;
        newContent = newContent.slice(0, position) + '\n\n' + data.suggestion + '\n\n' + newContent.slice(position);
        break;
    }

    return {
      newContent,
      applied: true,
      type: data.applyType
    };
  }
}