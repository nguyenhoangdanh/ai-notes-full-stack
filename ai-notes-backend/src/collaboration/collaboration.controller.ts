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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollaborationService } from './collaboration.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { IsString, IsEmail, IsEnum } from 'class-validator';

export class InviteCollaboratorDto {
  @IsEmail()
  email: string;

  @IsEnum(['READ', 'write', 'admin'])
  permission: 'read' | 'write' | 'admin';
}

export class UpdatePermissionDto {
  @IsEnum(['read', 'write', 'admin'])
  permission: 'read' | 'write' | 'admin';
}

@ApiTags('collaboration')
@ApiBearerAuth()
@Controller('collaboration')
@UseGuards(JwtAuthGuard)
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post('notes/:noteId/invite')
  @ApiOperation({ summary: 'Invite user to collaborate on note' })
  @ApiResponse({ status: 201, description: 'Collaborator invited successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'User already collaborating' })
  async inviteCollaborator(
    @Param('noteId') noteId: string,
    @Body() data: InviteCollaboratorDto,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.collaborationService.inviteCollaborator(
        noteId,
        user.id,
        data.email,
        data.permission.toUpperCase() as any
      );
    } catch (error) {
      console.error('Invite collaborator error:', error);
      return {
        success: false,
        message: error.message || 'Failed to invite collaborator'
      };
    }
  }

  @Get('notes/:noteId/collaborators')
  @ApiOperation({ summary: 'Get note collaborators' })
  @ApiResponse({ status: 200, description: 'Collaborators retrieved successfully' })
  async getCollaborators(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const collaborators = await this.collaborationService.getCollaborators(noteId, user.id);
      
      return {
        success: true,
        noteId,
        collaborators,
        count: collaborators.length
      };
    } catch (error) {
      console.error('Get collaborators error:', error);
      return {
        success: false,
        collaborators: [],
        error: error.message
      };
    }
  }

  @Delete('notes/:noteId/collaborators/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove collaborator from note' })
  @ApiResponse({ status: 204, description: 'Collaborator removed successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async removeCollaborator(
    @Param('noteId') noteId: string,
    @Param('userId') collaboratorUserId: string,
    @CurrentUser() user: User,
  ) {
    try {
      await this.collaborationService.removeCollaborator(noteId, collaboratorUserId, user.id);
      return { success: true };
    } catch (error) {
      console.error('Remove collaborator error:', error);
      throw error;
    }
  }

  @Patch('notes/:noteId/collaborators/:userId/permission')
  @ApiOperation({ summary: 'Update collaborator permissions' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updatePermission(
    @Param('noteId') noteId: string,
    @Param('userId') collaboratorUserId: string,
    @Body() data: UpdatePermissionDto,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.collaborationService.updateCollaboratorPermission(
        noteId,
        collaboratorUserId,
        data.permission.toUpperCase() as any,
        user.id
      );
    } catch (error) {
      console.error('Update permission error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update permission'
      };
    }
  }

  @Get('notes/:noteId/permission')
  @ApiOperation({ summary: 'Get user permission for note' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully' })
  async getUserPermission(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const permission = await this.collaborationService.getUserPermission(noteId, user.id);
      
      return {
        success: true,
        noteId,
        permission,
        hasAccess: !!permission
      };
    } catch (error) {
      console.error('Get permission error:', error);
      return {
        success: false,
        permission: null,
        hasAccess: false,
        error: error.message
      };
    }
  }

  @Get('my-collaborations')
  @ApiOperation({ summary: 'Get notes user is collaborating on' })
  @ApiResponse({ status: 200, description: 'Collaborations retrieved successfully' })
  async getMyCollaborations(@CurrentUser() user: User) {
    try {
      const collaborations = await this.collaborationService.getCollaboratedNotes(user.id);
      
      return {
        success: true,
        collaborations,
        count: collaborations.length
      };
    } catch (error) {
      console.error('Get collaborations error:', error);
      return {
        success: false,
        collaborations: [],
        error: error.message
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get collaboration statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getCollaborationStats(@CurrentUser() user: User) {
    try {
      const stats = await this.collaborationService.getCollaborationStats(user.id);
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get collaboration stats error:', error);
      return {
        success: false,
        stats: {
          ownedNotes: 0,
          collaboratedNotes: 0,
          totalCollaborators: 0
        }
      };
    }
  }

  @Post('notes/:noteId/join')
  @ApiOperation({ summary: 'Join note collaboration session' })
  @ApiResponse({ status: 200, description: 'Joined collaboration successfully' })
  async joinCollaboration(
    @Param('noteId') noteId: string,
    @Body() data: { socketId: string },
    @CurrentUser() user: User,
  ) {
    try {
      return await this.collaborationService.userJoined(noteId, user.id, data.socketId);
    } catch (error) {
      console.error('Join collaboration error:', error);
      return {
        success: false,
        message: error.message || 'Failed to join collaboration'
      };
    }
  }

  @Post('leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave collaboration session' })
  @ApiResponse({ status: 204, description: 'Left collaboration successfully' })
  async leaveCollaboration(
    @Body() data: { socketId: string },
  ) {
    await this.collaborationService.userLeft(data.socketId);
    return { success: true };
  }

  @Post('cursor-update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update user cursor position' })
  @ApiResponse({ status: 204, description: 'Cursor updated successfully' })
  async updateCursor(
    @Body() data: {
      socketId: string;
      cursor: {
        line: number;
        column: number;
        selection?: { start: number; end: number };
      };
    },
  ) {
    await this.collaborationService.updateUserCursor(data.socketId, data.cursor);
    return { success: true };
  }
}
