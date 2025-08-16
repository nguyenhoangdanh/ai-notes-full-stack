import { Controller, Post, Body, UseGuards, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';

interface ChatQueryDto {
  query: string;
  model?: string;
  maxTokens?: number;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('stream')
  async stream(
    @Body() data: ChatQueryDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    try {
      console.log('Chat stream endpoint hit:', { userId: user.id, query: data.query });

      // Validate input
      if (!data.query || typeof data.query !== 'string' || data.query.trim().length === 0) {
        throw new HttpException('Query is required and must be a non-empty string', HttpStatus.BAD_REQUEST);
      }

      const { stream, citations } = await this.chatService.streamResponse(
        data.query.trim(),
        user.id,
      );

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Expose-Headers', 'X-Citations');
      res.setHeader('X-Citations', JSON.stringify(citations));

      console.log('Starting stream with citations:', citations.length);

      // Handle the streaming response with better error handling
      let hasContent = false;
      let chunkCount = 0;
      
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            hasContent = true;
            chunkCount++;
            console.log(`📝 Chunk ${chunkCount} (${content.length} chars): "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`);
            
            // Make sure we're writing the content
            res.write(content);
            
            // Optional: Add small delay to make streaming more visible
            // await new Promise(resolve => setTimeout(resolve, 10));
          } else {
            console.log('⚠️ Empty chunk received:', chunk);
          }
        }
        
        console.log(`✅ Stream completed successfully. Total chunks: ${chunkCount}`);
        
        if (!hasContent) {
          console.log('⚠️ No content received, writing fallback message');
          res.write('Xin chào! Tôi là trợ lý AI Notes. Tôi có thể giúp bạn tìm kiếm thông tin trong ghi chú của mình. Bạn có câu hỏi gì không?');
        }
        
      } catch (streamError) {
        console.error('❌ Stream processing error:', streamError);
        if (!hasContent) {
          res.write('Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.');
        }
      }

      res.end();
    } catch (error) {
      console.error('❌ Chat stream error:', error);
      
      // If headers haven't been sent yet, send proper error response
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Internal server error',
          message: error.message || 'Failed to process chat request'
        });
      } else {
        // If we're already streaming, just end the response
        res.end();
      }
    }
  }

  @Post('complete')
  async complete(
    @Body() data: ChatQueryDto,
    @CurrentUser() user: User,
  ) {
    try {
      console.log('Chat complete endpoint hit:', { userId: user.id, query: data.query });

      if (!data.query || typeof data.query !== 'string' || data.query.trim().length === 0) {
        throw new HttpException('Query is required and must be a non-empty string', HttpStatus.BAD_REQUEST);
      }

      const result = await this.chatService.completeResponse(data.query.trim(), user.id);
      return result;
    } catch (error) {
      console.error('Chat complete error:', error);
      throw new HttpException(
        error.message || 'Failed to process chat request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('suggest')
  async generateSuggestion(
    @Body() data: {
      content: string;
      selectedText?: string;
      suggestionType: 'improve' | 'expand' | 'summarize' | 'restructure' | 'examples' | 'grammar' | 'translate';
      targetLanguage?: string;
    },
    @CurrentUser() user: User,
  ) {
    try {
      console.log('AI suggestion request:', { 
        userId: user.id, 
        type: data.suggestionType,
        hasSelection: !!data.selectedText 
      });

      const result = await this.chatService.generateSuggestion(
        data.content,
        data.selectedText,
        data.suggestionType,
        user.id,
        data.targetLanguage
      );

      return result;
    } catch (error) {
      console.error('Suggestion generation error:', error);
      throw new HttpException(
        error.message || 'Failed to generate suggestion',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('apply-suggestion')
  async applySuggestion(
    @Body() data: {
      noteId: string;
      originalContent: string;
      suggestion: string;
      selectedText?: string;
      applyType: 'replace' | 'append' | 'insert';
      position?: number;
    },
    @CurrentUser() user: User,
  ) {
    try {
      return await this.chatService.applySuggestion(data, user.id);
    } catch (error) {
      console.error('Apply suggestion error:', error);
      throw new HttpException(
        error.message || 'Failed to apply suggestion',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
