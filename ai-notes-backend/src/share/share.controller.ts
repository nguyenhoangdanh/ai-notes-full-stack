import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShareService, CreateShareLinkOptions } from './share.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { Request } from 'express';
import { IsString, IsBoolean, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShareLinkDto {
  @IsBoolean()
  isPublic: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean = false;

  @IsOptional()
  @IsBoolean()
  requireAuth?: boolean = false;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100000)
  maxViews?: number;

  @IsOptional()
  @IsString()
  password?: string;
}

export class AccessSharedNoteDto {
  @IsOptional()
  @IsString()
  password?: string;
}

@ApiTags('share')
@ApiBearerAuth()
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post('notes/:noteId/create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create share link for a note' })
  @ApiResponse({ status: 201, description: 'Share link created successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to share this note' })
  async createShareLink(
    @Param('noteId') noteId: string,
    @Body() data: CreateShareLinkDto,
    @CurrentUser() user: User,
  ) {
    try {
      const options: CreateShareLinkOptions = {
        isPublic: data.isPublic,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        allowComments: data.allowComments,
        requireAuth: data.requireAuth,
        maxViews: data.maxViews,
        password: data.password,
      };

      return await this.shareService.createShareLink(noteId, user.id, options);
    } catch (error) {
      console.error('Create share link error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create share link'
      };
    }
  }

  @Patch(':shareLinkId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update share link settings' })
  @ApiResponse({ status: 200, description: 'Share link updated successfully' })
  async updateShareLink(
    @Param('shareLinkId') shareLinkId: string,
    @Body() data: Partial<CreateShareLinkDto>,
    @CurrentUser() user: User,
  ) {
    try {
      const options: Partial<CreateShareLinkOptions> = {
        isPublic: data.isPublic,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        allowComments: data.allowComments,
        requireAuth: data.requireAuth,
        maxViews: data.maxViews,
        password: data.password,
      };

      return await this.shareService.updateShareLink(shareLinkId, user.id, options);
    } catch (error) {
      console.error('Update share link error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update share link'
      };
    }
  }

  @Delete(':shareLinkId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete share link' })
  @ApiResponse({ status: 204, description: 'Share link deleted successfully' })
  async deleteShareLink(
    @Param('shareLinkId') shareLinkId: string,
    @CurrentUser() user: User,
  ) {
    try {
      await this.shareService.deleteShareLink(shareLinkId, user.id);
      return { success: true };
    } catch (error) {
      console.error('Delete share link error:', error);
      throw error;
    }
  }

  @Get('my-shares')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user share links' })
  @ApiResponse({ status: 200, description: 'Share links retrieved successfully' })
  async getMyShares(@CurrentUser() user: User) {
    try {
      const shareLinks = await this.shareService.getShareLinksByUser(user.id);
      
      return {
        success: true,
        shareLinks,
        count: shareLinks.length
      };
    } catch (error) {
      console.error('Get my shares error:', error);
      return {
        success: false,
        shareLinks: [],
        error: error.message
      };
    }
  }

  @Get(':token/access')
  @ApiOperation({ summary: 'Access shared note by token' })
  @ApiResponse({ status: 200, description: 'Shared note retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Share link not found' })
  async accessSharedNote(
    @Param('token') token: string,
    @Body() data: AccessSharedNoteDto,
    @Req() req: Request,
  ) {
    try {
      // Extract viewer info from request
      const viewerInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || '',
        referrer: req.headers.referer,
        userId: req.user?.['id'], // If user is authenticated
      };

      const sharedNote = await this.shareService.getSharedNoteByToken(
        token,
        data.password,
        viewerInfo
      );

      return {
        success: true,
        sharedNote
      };
    } catch (error) {
      console.error('Access shared note error:', error);
      
      if (error instanceof UnauthorizedException || error.message.includes('password')) {
        return {
          success: false,
          requiresPassword: error.message.includes('Password required'),
          message: error.message
        };
      }
      
      return {
        success: false,
        message: error.message || 'Failed to access shared note'
      };
    }
  }

  @Get(':shareLinkId/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get share link analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getShareAnalytics(
    @Param('shareLinkId') shareLinkId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const analytics = await this.shareService.getShareLinkAnalytics(shareLinkId, user.id);
      
      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Get share analytics error:', error);
      return {
        success: false,
        analytics: null,
        error: error.message
      };
    }
  }

  @Patch(':shareLinkId/toggle-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enable/disable share link' })
  @ApiResponse({ status: 200, description: 'Share link status toggled successfully' })
  async toggleShareStatus(
    @Param('shareLinkId') shareLinkId: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.shareService.toggleShareLinkStatus(shareLinkId, user.id);
    } catch (error) {
      console.error('Toggle share status error:', error);
      return {
        success: false,
        message: error.message || 'Failed to toggle share status'
      };
    }
  }

  @Post(':shareLinkId/regenerate-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Regenerate share link token' })
  @ApiResponse({ status: 200, description: 'Token regenerated successfully' })
  async regenerateToken(
    @Param('shareLinkId') shareLinkId: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.shareService.regenerateShareToken(shareLinkId, user.id);
    } catch (error) {
      console.error('Regenerate token error:', error);
      return {
        success: false,
        message: error.message || 'Failed to regenerate token'
      };
    }
  }

  @Get('stats/summary')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get share statistics summary' })
  @ApiResponse({ status: 200, description: 'Share stats retrieved successfully' })
  async getShareStatsSummary(@CurrentUser() user: User) {
    try {
      const stats = await this.shareService.getShareStatsSummary(user.id);
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get share stats error:', error);
      return {
        success: false,
        stats: {
          totalShares: 0,
          activeShares: 0,
          inactiveShares: 0,
          totalViews: 0,
          recentViews: 0
        }
      };
    }
  }

  @Get('check/:token')
  @ApiOperation({ summary: 'Check if share link exists and is valid' })
  @ApiResponse({ status: 200, description: 'Share link status checked' })
  async checkShareLink(@Param('token') token: string) {
    try {
      // This is a lightweight check without recording a view
      const shareLink = await this.shareService['prisma'].shareLink.findUnique({
        where: { token },
        select: {
          id: true,
          isPublic: true,
          expiresAt: true,
          requireAuth: true,
          passwordHash: true,
          note: {
            select: { title: true }
          }
        }
      });

      if (!shareLink) {
        return {
          exists: false,
          message: 'Share link not found'
        };
      }

      const isExpired = shareLink.expiresAt && new Date() > shareLink.expiresAt;

      return {
        exists: true,
        isValid: !isExpired,
        requiresPassword: !!shareLink.passwordHash,
        requiresAuth: shareLink.requireAuth,
        isPublic: shareLink.isPublic,
        noteTitle: shareLink.note.title,
        isExpired
      };
    } catch (error) {
      console.error('Check share link error:', error);
      return {
        exists: false,
        message: 'Failed to check share link'
      };
    }
  }
}
