import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfflineSyncDto, ProcessSyncDto } from './dto/offline-sync.dto';
import { SyncAction } from '@prisma/client';
import { NotesService } from '../../notes/notes.service';

@Injectable()
export class OfflineSyncService {
  constructor(
    private prisma: PrismaService,
    private notesService: NotesService,
  ) {}

  async queueSync(createOfflineSyncDto: CreateOfflineSyncDto, userId: string) {
    const offlineSync = await this.prisma.offlineSync.create({
      data: {
        ...createOfflineSyncDto,
        userId,
        timestamp: new Date(createOfflineSyncDto.timestamp),
        synced: false,
      },
    });

    return offlineSync;
  }

  async getPendingSync(userId: string, deviceId?: string) {
    const where: any = {
      userId,
      synced: false,
    };

    if (deviceId) {
      where.deviceId = deviceId;
    }

    return this.prisma.offlineSync.findMany({
      where,
      orderBy: {
        timestamp: 'asc',
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async processSync(processSyncDto: ProcessSyncDto, userId: string) {
    const pendingActions = await this.getPendingSync(userId, processSyncDto.deviceId);
    const results = [];

    for (const syncAction of pendingActions) {
      try {
        const result = await this.processSyncAction(syncAction, userId);
        await this.markSynced(syncAction.id);
        results.push({
          id: syncAction.id,
          action: syncAction.action,
          noteId: syncAction.noteId,
          status: 'success',
          result,
        });
      } catch (error) {
        // Handle conflicts and errors
        results.push({
          id: syncAction.id,
          action: syncAction.action,
          noteId: syncAction.noteId,
          status: 'error',
          error: error.message,
          conflictId: error.name === 'ConflictException' ? syncAction.id : undefined,
        });
      }
    }

    return {
      processedCount: results.length,
      successCount: results.filter(r => r.status === 'success').length,
      errorCount: results.filter(r => r.status === 'error').length,
      results,
    };
  }

  private async processSyncAction(syncAction: any, userId: string) {
    switch (syncAction.action) {
      case SyncAction.CREATE:
        return this.handleCreateSync(syncAction, userId);
      
      case SyncAction.UPDATE:
        return this.handleUpdateSync(syncAction, userId);
      
      case SyncAction.DELETE:
        return this.handleDeleteSync(syncAction, userId);
      
      default:
        throw new Error(`Unknown sync action: ${syncAction.action}`);
    }
  }

  private async handleCreateSync(syncAction: any, userId: string) {
    // Check if note already exists (could be created by another device)
    const existingNote = await this.prisma.note.findFirst({
      where: {
        id: syncAction.noteId,
        ownerId: userId,
      },
    });

    if (existingNote) {
      // Note already exists, this might be a conflict
      // Compare timestamps to decide which version to keep
      if (existingNote.updatedAt > syncAction.timestamp) {
        throw new ConflictException('Note already exists with newer timestamp');
      } else {
        // Update with offline data
        return this.notesService.update(syncAction.noteId, syncAction.data, userId);
      }
    }

    // Create new note with specific ID from offline data
    return this.prisma.note.create({
      data: {
        id: syncAction.noteId,
        ...syncAction.data,
        ownerId: userId,
        createdAt: syncAction.timestamp,
        updatedAt: syncAction.timestamp,
      },
    });
  }

  private async handleUpdateSync(syncAction: any, userId: string) {
    const existingNote = await this.prisma.note.findFirst({
      where: {
        id: syncAction.noteId,
        ownerId: userId,
        isDeleted: false,
      },
    });

    if (!existingNote) {
      throw new NotFoundException('Note not found for update');
    }

    // Check for conflicts (server version newer than offline version)
    if (existingNote.updatedAt > syncAction.timestamp) {
      throw new ConflictException('Server version is newer than offline version');
    }

    return this.notesService.update(syncAction.noteId, syncAction.data, userId);
  }

  private async handleDeleteSync(syncAction: any, userId: string) {
    const existingNote = await this.prisma.note.findFirst({
      where: {
        id: syncAction.noteId,
        ownerId: userId,
      },
    });

    if (!existingNote) {
      // Note already deleted or doesn't exist
      return { message: 'Note already deleted' };
    }

    // Check if note was modified after the delete timestamp
    if (existingNote.updatedAt > syncAction.timestamp) {
      throw new ConflictException('Note was modified after delete timestamp');
    }

    await this.notesService.remove(syncAction.noteId, userId);
    return { message: 'Note deleted successfully' };
  }

  private async markSynced(syncId: string) {
    await this.prisma.offlineSync.update({
      where: { id: syncId },
      data: {
        synced: true,
        syncedAt: new Date(),
      },
    });
  }

  async resolveConflict(syncId: string, resolution: 'keep_server' | 'keep_offline', userId: string) {
    const syncAction = await this.prisma.offlineSync.findFirst({
      where: {
        id: syncId,
        userId,
      },
    });

    if (!syncAction) {
      throw new NotFoundException('Sync action not found');
    }

    if (resolution === 'keep_server') {
      // Mark as synced without applying changes
      await this.markSynced(syncId);
      return { message: 'Conflict resolved: keeping server version' };
    } else {
      // Force apply offline changes
      try {
        const result = await this.forceSyncAction(syncAction, userId);
        await this.markSynced(syncId);
        return {
          message: 'Conflict resolved: applied offline version',
          result,
        };
      } catch (error) {
        throw new Error(`Failed to force sync: ${error.message}`);
      }
    }
  }

  private async forceSyncAction(syncAction: any, userId: string) {
    // Force apply the sync action regardless of conflicts
    switch (syncAction.action) {
      case SyncAction.CREATE:
      case SyncAction.UPDATE:
        return this.prisma.note.upsert({
          where: { id: syncAction.noteId },
          create: {
            id: syncAction.noteId,
            ...syncAction.data,
            ownerId: userId,
          },
          update: {
            ...syncAction.data,
            updatedAt: new Date(),
          },
        });
      
      case SyncAction.DELETE:
        return this.prisma.note.updateMany({
          where: {
            id: syncAction.noteId,
            ownerId: userId,
          },
          data: {
            isDeleted: true,
          },
        });
      
      default:
        throw new Error(`Unknown sync action: ${syncAction.action}`);
    }
  }

  async getSyncStats(userId: string) {
    const [totalSync, pendingSync, syncedCount, conflictCount] = await Promise.all([
      this.prisma.offlineSync.count({
        where: { userId },
      }),
      this.prisma.offlineSync.count({
        where: { userId, synced: false },
      }),
      this.prisma.offlineSync.count({
        where: { userId, synced: true },
      }),
      this.prisma.offlineSync.count({
        where: { userId, conflictId: { not: null } },
      }),
    ]);

    const deviceStats = await this.prisma.offlineSync.groupBy({
      by: ['deviceId'],
      where: { userId },
      _count: {
        deviceId: true,
      },
    });

    return {
      totalSync,
      pendingSync,
      syncedCount,
      conflictCount,
      devices: deviceStats.map(stat => ({
        deviceId: stat.deviceId,
        syncCount: stat._count.deviceId,
      })),
    };
  }

  async clearSyncedHistory(userId: string, olderThanDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.prisma.offlineSync.deleteMany({
      where: {
        userId,
        synced: true,
        syncedAt: {
          lt: cutoffDate,
        },
      },
    });

    return { deletedCount: result.count };
  }
}