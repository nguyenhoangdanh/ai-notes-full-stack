import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RelationsService } from './relations.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../types/user.types';
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FindRelatedNotesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}

export class SaveRelationDto {
  @IsString()
  targetNoteId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  relevance: number;

  @IsEnum(['SEMANTIC', 'CONTEXTUAL', 'TEMPORAL', 'REFERENCE'])
  type: 'SEMANTIC' | 'CONTEXTUAL' | 'TEMPORAL' | 'REFERENCE';
}

@ApiTags('relations')
@ApiBearerAuth()
@Controller('relations')
@UseGuards(JwtAuthGuard)
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Get('notes/:noteId/related')
  @ApiOperation({ summary: 'Find related notes for a specific note using AI analysis' })
  @ApiResponse({ status: 200, description: 'Related notes found successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of related notes (1-20)', type: Number })
  async findRelatedNotes(
    @Param('noteId') noteId: string,
    @Query() query: FindRelatedNotesDto,
    @CurrentUser() user: User,
  ) {
    try {
      const relatedNotes = await this.relationsService.findRelatedNotes(
        noteId, 
        user.id, 
        query.limit
      );

      return {
        success: true,
        noteId,
        count: relatedNotes.length,
        relatedNotes,
        message: relatedNotes.length > 0 
          ? `Found ${relatedNotes.length} related note(s)`
          : 'No related notes found'
      };
    } catch (error) {
      console.error('Find related notes error:', error);
      return {
        success: false,
        noteId,
        count: 0,
        relatedNotes: [],
        message: 'Failed to find related notes',
        error: error.message
      };
    }
  }

  @Get('notes/:noteId/stored')
  @ApiOperation({ summary: 'Get previously stored relations for a note' })
  @ApiResponse({ status: 200, description: 'Stored relations retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of relations', type: Number })
  async getStoredRelations(
    @Param('noteId') noteId: string,
    @Query() query: FindRelatedNotesDto,
    @CurrentUser() user: User,
  ) {
    try {
      const storedRelations = await this.relationsService.getStoredRelations(
        noteId, 
        user.id, 
        query.limit || 10
      );

      return {
        success: true,
        noteId,
        count: storedRelations.length,
        relations: storedRelations,
        message: storedRelations.length > 0 
          ? `Found ${storedRelations.length} stored relation(s)`
          : 'No stored relations found'
      };
    } catch (error) {
      console.error('Get stored relations error:', error);
      return {
        success: false,
        noteId,
        count: 0,
        relations: [],
        message: 'Failed to retrieve stored relations',
        error: error.message
      };
    }
  }

  @Post('notes/:noteId/save-relation')
  @ApiOperation({ summary: 'Manually save a relation between two notes' })
  @ApiResponse({ status: 201, description: 'Relation saved successfully' })
  async saveRelation(
    @Param('noteId') sourceNoteId: string,
    @Body() data: SaveRelationDto,
    @CurrentUser() user: User,
  ) {
    try {
      // Validate that both notes exist and belong to user
      const [sourceNote, targetNote] = await Promise.all([
        this.relationsService['prisma'].note.findFirst({
          where: { id: sourceNoteId, ownerId: user.id, isDeleted: false }
        }),
        this.relationsService['prisma'].note.findFirst({
          where: { id: data.targetNoteId, ownerId: user.id, isDeleted: false }
        })
      ]);

      if (!sourceNote || !targetNote) {
        return {
          success: false,
          message: 'One or both notes not found or not owned by user'
        };
      }

      if (sourceNoteId === data.targetNoteId) {
        return {
          success: false,
          message: 'Cannot create relation from note to itself'
        };
      }

      const relation = await this.relationsService.saveRelatedNote(
        sourceNoteId,
        data.targetNoteId,
        data.relevance,
        data.type,
        user.id,
      );

      return {
        success: true,
        relation,
        message: 'Relation saved successfully'
      };
    } catch (error) {
      console.error('Save relation error:', error);
      return {
        success: false,
        message: 'Failed to save relation',
        error: error.message
      };
    }
  }

  @Post('notes/:noteId/analyze')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue background relation analysis for a note' })
  @ApiResponse({ status: 202, description: 'Relation analysis job queued successfully' })
  async queueAnalysis(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      await this.relationsService.queueRelationAnalysis(noteId, user.id);
      
      return { 
        success: true,
        message: 'Relation analysis job queued successfully',
        noteId
      };
    } catch (error) {
      console.error('Queue relation analysis error:', error);
      return {
        success: false,
        message: 'Failed to queue relation analysis',
        error: error.message
      };
    }
  }

  @Get('notes/:noteId/graph')
  @ApiOperation({ summary: 'Get relation graph data for visualization' })
  @ApiResponse({ status: 200, description: 'Relation graph data retrieved' })
  async getRelationGraph(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
    @Query('depth') depth?: string, 
  ) {
    try {
      const maxDepth = depth ? parseInt(depth) : 2;
      const graphData = await this.buildRelationGraph(noteId, user.id, maxDepth);

      return {
        success: true,
        noteId,
        depth: maxDepth,
        nodes: graphData.nodes,
        edges: graphData.edges,
        totalNodes: graphData.nodes.length,
        totalEdges: graphData.edges.length
      };
    } catch (error) {
      console.error('Get relation graph error:', error);
      return {
        success: false,
        message: 'Failed to build relation graph',
        error: error.message
      };
    }
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get relation statistics for user' })
  @ApiResponse({ status: 200, description: 'Relation statistics retrieved' })
  async getRelationStats(@CurrentUser() user: User) {
    try {
      const [totalRelations, relationsByType, topConnectedNotes] = await Promise.all([
        this.relationsService['prisma'].relatedNote.count({
          where: {
            sourceNote: { ownerId: user.id }
          }
        }),
        this.relationsService['prisma'].relatedNote.groupBy({
          by: ['type'],
          where: {
            sourceNote: { ownerId: user.id }
          },
          _count: { type: true }
        }),
        this.relationsService['prisma'].relatedNote.groupBy({
          by: ['sourceNoteId'],
          where: {
            sourceNote: { ownerId: user.id }
          },
          _count: { sourceNoteId: true },
          orderBy: {
            _count: { sourceNoteId: 'desc' }
          },
          take: 5
        })
      ]);

      return {
        success: true,
        stats: {
          totalRelations,
          relationsByType: relationsByType.reduce((acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
          }, {}),
          topConnectedNotes: topConnectedNotes.map(item => ({
            noteId: item.sourceNoteId,
            connectionCount: item._count.sourceNoteId
          }))
        }
      };
    } catch (error) {
      console.error('Get relation stats error:', error);
      return {
        success: false,
        stats: {
          totalRelations: 0,
          relationsByType: {},
          topConnectedNotes: []
        }
      };
    }
  }

  @Delete('notes/:sourceNoteId/relations/:targetNoteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a relation between two notes' })
  @ApiResponse({ status: 204, description: 'Relation deleted successfully' })
  async deleteRelation(
    @Param('sourceNoteId') sourceNoteId: string,
    @Param('targetNoteId') targetNoteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      await this.relationsService['prisma'].relatedNote.deleteMany({
        where: {
          OR: [
            { sourceNoteId, targetNoteId },
            { sourceNoteId: targetNoteId, targetNoteId: sourceNoteId }
          ],
          sourceNote: { ownerId: user.id }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Delete relation error:', error);
      throw error;
    }
  }

  private async buildRelationGraph(noteId: string, userId: string, maxDepth: number) {
    const nodes = new Map();
    const edges = new Set();
    const visited = new Set();

    // Build graph recursively
    const exploreRelations = async (currentNoteId: string, currentDepth: number) => {
      if (currentDepth > maxDepth || visited.has(currentNoteId)) return;
      visited.add(currentNoteId);

      // Get note details
      const note = await this.relationsService['prisma'].note.findFirst({
        where: { id: currentNoteId, ownerId: userId, isDeleted: false },
        select: { id: true, title: true, createdAt: true }
      });

      if (!note) return;

      nodes.set(currentNoteId, {
        id: currentNoteId,
        title: note.title,
        depth: currentDepth,
        createdAt: note.createdAt
      });

      if (currentDepth < maxDepth) {
        // Get related notes
        const relations = await this.relationsService['prisma'].relatedNote.findMany({
          where: {
            OR: [
              { sourceNoteId: currentNoteId },
              { targetNoteId: currentNoteId }
            ],
            sourceNote: { ownerId: userId },
            targetNote: { ownerId: userId }
          },
          include: {
            sourceNote: { select: { id: true, title: true } },
            targetNote: { select: { id: true, title: true } }
          }
        });

        for (const relation of relations) {
          const relatedNoteId = relation.sourceNoteId === currentNoteId 
            ? relation.targetNoteId 
            : relation.sourceNoteId;

          // Add edge
          const edgeKey = [currentNoteId, relatedNoteId].sort().join('-');
          edges.add({
            id: edgeKey,
            source: currentNoteId,
            target: relatedNoteId,
            type: relation.type,
            relevance: relation.relevance
          });

          // Recursively explore
          await exploreRelations(relatedNoteId, currentDepth + 1);
        }
      }
    };

    await exploreRelations(noteId, 0);

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges)
    };
  }
}
