import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface VersionDiff {
  type: 'added' | 'removed' | 'modified';
  lineNumber: number;
  oldText?: string;
  newText?: string;
  context?: string;
}

export interface VersionComparison {
  oldVersion: {
    version: number;
    title: string;
    content: string;
    createdAt: Date;
  };
  newVersion: {
    version: number;
    title: string;
    content: string;
    createdAt: Date;
  };
  differences: {
    titleChanged: boolean;
    contentDiffs: VersionDiff[];
    statistics: {
      linesAdded: number;
      linesRemoved: number;
      linesModified: number;
      wordsAdded: number;
      wordsRemoved: number;
    };
  };
}

export interface CreateVersionOptions {
  changeLog?: string;
  isAutomatic?: boolean;
  forceSave?: boolean;
  changeType?: 'major' | 'minor' | 'patch';
}

@Injectable()
export class VersionsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('version-control') private versionQueue: Queue,
  ) {}

  async createVersion(
    noteId: string, 
    userId: string, 
    options: CreateVersionOptions = {}
  ) {
    // Verify note ownership directly with Prisma
    const note = await this.prisma.note.findFirst({
      where: { 
        id: noteId, 
        ownerId: userId,
        isDeleted: false 
      }
    });

    if (!note) {
      throw new NotFoundException('Note not found or not accessible');
    }

    // Get current version number
    const lastVersion = await this.prisma.noteVersion.findFirst({
      where: { noteId },
      orderBy: { version: 'desc' },
      select: { version: true, title: true, content: true, createdAt: true }
    });

    const nextVersion = (lastVersion?.version || 0) + 1;

    // Check if version should be created (avoid duplicate versions)
    if (lastVersion && !options.forceSave) {
      const hasSignificantChanges = this.hasSignificantChanges(
        { title: lastVersion.title, content: lastVersion.content },
        { title: note.title, content: note.content }
      );

      if (!hasSignificantChanges && !options.isAutomatic) {
        return {
          created: false,
          message: 'No significant changes detected',
          existingVersion: lastVersion.version
        };
      }
    }

    // Generate change log if not provided
    let changeLog = options.changeLog;
    if (!changeLog && lastVersion) {
      changeLog = await this.generateAutoChangeLog(
        { title: lastVersion.title, content: lastVersion.content },
        { title: note.title, content: note.content }
      );
    }

    // Create version
    const version = await this.prisma.noteVersion.create({
      data: {
        noteId,
        version: nextVersion,
        title: note.title,
        content: note.content,
        changeLog: changeLog || `Version ${nextVersion}`,
        createdBy: userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    // Queue cleanup old versions if needed
    await this.queueVersionCleanup(noteId, userId);

    // Queue version analytics update
    await this.queueVersionAnalytics(noteId, userId);

    return {
      created: true,
      version: {
        id: version.id,
        version: version.version,
        title: version.title,
        changeLog: version.changeLog,
        createdAt: version.createdAt,
        createdBy: version.user
      },
      message: `Version ${nextVersion} created successfully`
    };
  }

  async getVersionHistory(noteId: string, userId: string, limit: number = 50) {
    // Verify note access directly with Prisma
    const note = await this.prisma.note.findFirst({
      where: { 
        id: noteId, 
        ownerId: userId,
        isDeleted: false 
      }
    });

    if (!note) {
      throw new NotFoundException('Note not found or not accessible');
    }

    const versions = await this.prisma.noteVersion.findMany({
      where: { noteId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: { version: 'desc' },
      take: limit
    });

    return versions.map(version => ({
      id: version.id,
      version: version.version,
      title: version.title,
      changeLog: version.changeLog,
      createdAt: version.createdAt,
      createdBy: version.user,
      wordCount: version.content.split(/\s+/).length,
      characterCount: version.content.length
    }));
  }

  async getVersion(versionId: string, userId: string) {
    const version = await this.prisma.noteVersion.findFirst({
      where: { 
        id: versionId,
        note: { ownerId: userId } // Ensure user owns the note
      },
      include: {
        note: {
          select: { id: true, title: true, ownerId: true }
        },
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    if (!version) {
      throw new NotFoundException('Version not found or not accessible');
    }

    return {
      id: version.id,
      version: version.version,
      title: version.title,
      content: version.content,
      changeLog: version.changeLog,
      createdAt: version.createdAt,
      createdBy: version.user,
      note: {
        id: version.note.id,
        currentTitle: version.note.title
      },
      statistics: {
        wordCount: version.content.split(/\s+/).length,
        characterCount: version.content.length,
        lineCount: version.content.split('\n').length
      }
    };
  }

  async compareVersions(
    noteId: string,
    fromVersion: number,
    toVersion: number,
    userId: string
  ): Promise<VersionComparison> {
    // Verify note access
    const note = await this.prisma.note.findFirst({
      where: { 
        id: noteId, 
        ownerId: userId,
        isDeleted: false 
      }
    });

    if (!note) {
      throw new NotFoundException('Note not found or not accessible');
    }

    const [oldVersionData, newVersionData] = await Promise.all([
      this.prisma.noteVersion.findFirst({
        where: { noteId, version: fromVersion }
      }),
      this.prisma.noteVersion.findFirst({
        where: { noteId, version: toVersion }
      })
    ]);

    if (!oldVersionData || !newVersionData) {
      throw new NotFoundException('One or both versions not found');
    }

    const oldVersion = {
      version: oldVersionData.version,
      title: oldVersionData.title,
      content: oldVersionData.content,
      createdAt: oldVersionData.createdAt
    };

    const newVersion = {
      version: newVersionData.version,
      title: newVersionData.title,
      content: newVersionData.content,
      createdAt: newVersionData.createdAt
    };

    const differences = this.calculateDifferences(oldVersion, newVersion);

    return {
      oldVersion,
      newVersion,
      differences
    };
  }

  async restoreVersion(versionId: string, userId: string) {
    const version = await this.prisma.noteVersion.findFirst({
      where: {
        id: versionId,
        note: { ownerId: userId }
      },
      include: {
        note: { select: { id: true, title: true, content: true } }
      }
    });

    if (!version) {
      throw new NotFoundException('Version not found or not accessible');
    }

    // Create a new version of current state before restoration
    await this.createVersion(version.noteId, userId, {
      changeLog: `Auto-save before restoring to version ${version.version}`,
      isAutomatic: true,
      forceSave: true
    });

    // Restore the note to the selected version
    const restoredNote = await this.prisma.note.update({
      where: { id: version.noteId },
      data: {
        title: version.title,
        content: version.content,
      },
      include: {
        workspace: {
          select: { id: true, name: true }
        }
      }
    });

    // Create a restoration log version
    await this.createVersion(version.noteId, userId, {
      changeLog: `Restored from version ${version.version}`,
      isAutomatic: true,
      forceSave: true
    });

    return {
      success: true,
      restoredNote,
      restoredFrom: {
        version: version.version,
        createdAt: version.createdAt
      },
      message: `Successfully restored note to version ${version.version}`
    };
  }

  async deleteVersion(versionId: string, userId: string) {
    const version = await this.prisma.noteVersion.findFirst({
      where: {
        id: versionId,
        note: { ownerId: userId }
      }
    });

    if (!version) {
      throw new NotFoundException('Version not found or not accessible');
    }

    // Prevent deletion of the only version
    const versionCount = await this.prisma.noteVersion.count({
      where: { noteId: version.noteId }
    });

    if (versionCount <= 1) {
      throw new ForbiddenException('Cannot delete the only version of a note');
    }

    // Prevent deletion of recent versions (less than 24 hours old)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (version.createdAt > dayAgo) {
      throw new ForbiddenException('Cannot delete versions less than 24 hours old');
    }

    await this.prisma.noteVersion.delete({
      where: { id: versionId }
    });

    return {
      success: true,
      message: `Version ${version.version} deleted successfully`
    };
  }

  async getVersionStatistics(noteId: string, userId: string) {
    // Verify note access directly with Prisma
    const note = await this.prisma.note.findFirst({
      where: { 
        id: noteId, 
        ownerId: userId,
        isDeleted: false 
      }
    });

    if (!note) {
      throw new NotFoundException('Note not found or not accessible');
    }

    const [totalVersions, firstVersion, lastVersion, versionActivity] = await Promise.all([
      this.prisma.noteVersion.count({
        where: { noteId }
      }),
      this.prisma.noteVersion.findFirst({
        where: { noteId },
        orderBy: { version: 'asc' },
        select: { version: true, createdAt: true }
      }),
      this.prisma.noteVersion.findFirst({
        where: { noteId },
        orderBy: { version: 'desc' },
        select: { version: true, createdAt: true, changeLog: true }
      }),
      this.prisma.noteVersion.groupBy({
        by: ['createdBy'],
        where: { noteId },
        _count: { createdBy: true },
        orderBy: { _count: { createdBy: 'desc' } }
      })
    ]);

    // Calculate version frequency (versions per day)
    let versionsPerDay = 0;
    if (firstVersion && lastVersion && totalVersions > 1) {
      const daysDiff = Math.max(1, 
        (lastVersion.createdAt.getTime() - firstVersion.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      versionsPerDay = Math.round((totalVersions / daysDiff) * 100) / 100;
    }

    return {
      totalVersions,
      versionsPerDay,
      firstVersion: firstVersion ? {
        version: firstVersion.version,
        createdAt: firstVersion.createdAt
      } : null,
      latestVersion: lastVersion ? {
        version: lastVersion.version,
        createdAt: lastVersion.createdAt,
        changeLog: lastVersion.changeLog
      } : null,
      contributorStats: versionActivity.map(stat => ({
        userId: stat.createdBy,
        versionCount: stat._count.createdBy
      }))
    };
  }

  private hasSignificantChanges(
    oldVersion: { title: string; content: string },
    newVersion: { title: string; content: string }
  ): boolean {
    // Title changes are always significant
    if (oldVersion.title !== newVersion.title) {
      return true;
    }

    // Calculate content similarity
    const oldWords = oldVersion.content.split(/\s+/).length;
    const newWords = newVersion.content.split(/\s+/).length;
    const wordDiff = Math.abs(newWords - oldWords);
    
    // Significant if:
    // - More than 50 words changed
    // - More than 20% of content changed
    // - Content length changed by more than 500 characters
    const characterDiff = Math.abs(newVersion.content.length - oldVersion.content.length);
    const wordChangeRatio = oldWords > 0 ? wordDiff / oldWords : 1;
    
    return wordDiff > 50 || 
           wordChangeRatio > 0.2 || 
           characterDiff > 500;
  }

  private async generateAutoChangeLog(
    oldVersion: { title: string; content: string },
    newVersion: { title: string; content: string }
  ): Promise<string> {
    const changes: string[] = [];

    // Title changes
    if (oldVersion.title !== newVersion.title) {
      changes.push(`Title changed: "${oldVersion.title}" → "${newVersion.title}"`);
    }

    // Content analysis
    const oldWordCount = oldVersion.content.split(/\s+/).length;
    const newWordCount = newVersion.content.split(/\s+/).length;
    const wordDiff = newWordCount - oldWordCount;

    if (wordDiff > 0) {
      changes.push(`Added ${wordDiff} words`);
    } else if (wordDiff < 0) {
      changes.push(`Removed ${Math.abs(wordDiff)} words`);
    }

    // Line changes
    const oldLines = oldVersion.content.split('\n').length;
    const newLines = newVersion.content.split('\n').length;
    const lineDiff = newLines - oldLines;

    if (lineDiff > 0) {
      changes.push(`Added ${lineDiff} lines`);
    } else if (lineDiff < 0) {
      changes.push(`Removed ${Math.abs(lineDiff)} lines`);
    }

    // Character changes
    const charDiff = newVersion.content.length - oldVersion.content.length;
    if (Math.abs(charDiff) > 100) {
      if (charDiff > 0) {
        changes.push(`Added ${charDiff} characters`);
      } else {
        changes.push(`Removed ${Math.abs(charDiff)} characters`);
      }
    }

    return changes.length > 0 
      ? `Auto-generated: ${changes.join(', ')}`
      : 'Minor changes';
  }

  private calculateDifferences(
    oldVersion: { title: string; content: string },
    newVersion: { title: string; content: string }
  ) {
    const titleChanged = oldVersion.title !== newVersion.title;
    const contentDiffs = this.calculateContentDiff(oldVersion.content, newVersion.content);
    
    const statistics = {
      linesAdded: contentDiffs.filter(d => d.type === 'added').length,
      linesRemoved: contentDiffs.filter(d => d.type === 'removed').length,
      linesModified: contentDiffs.filter(d => d.type === 'modified').length,
      wordsAdded: this.countWordsInDiffs(contentDiffs.filter(d => d.type === 'added')),
      wordsRemoved: this.countWordsInDiffs(contentDiffs.filter(d => d.type === 'removed'))
    };

    return {
      titleChanged,
      contentDiffs,
      statistics
    };
  }

  private calculateContentDiff(oldContent: string, newContent: string): VersionDiff[] {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diffs: VersionDiff[] = [];

    // Simple line-by-line diff implementation
    // This is a basic implementation - for production, consider using a library like 'diff'
    const maxLines = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined && newLine !== undefined) {
        // Line added
        diffs.push({
          type: 'added',
          lineNumber: i + 1,
          newText: newLine,
          context: this.getLineContext(newLines, i)
        });
      } else if (oldLine !== undefined && newLine === undefined) {
        // Line removed
        diffs.push({
          type: 'removed',
          lineNumber: i + 1,
          oldText: oldLine,
          context: this.getLineContext(oldLines, i)
        });
      } else if (oldLine !== newLine && oldLine !== undefined && newLine !== undefined) {
        // Line modified
        diffs.push({
          type: 'modified',
          lineNumber: i + 1,
          oldText: oldLine,
          newText: newLine,
          context: this.getLineContext(newLines, i)
        });
      }
    }

    return diffs.slice(0, 100); // Limit to 100 diffs for performance
  }

  private getLineContext(lines: string[], index: number): string {
    const contextSize = 1;
    const start = Math.max(0, index - contextSize);
    const end = Math.min(lines.length, index + contextSize + 1);
    return lines.slice(start, end).join('\n');
  }

  private countWordsInDiffs(diffs: VersionDiff[]): number {
    return diffs.reduce((total, diff) => {
      const text = diff.newText || diff.oldText || '';
      return total + text.split(/\s+/).length;
    }, 0);
  }

  private async queueVersionCleanup(noteId: string, userId: string) {
    try {
      await this.versionQueue.add(
        'cleanup-old-versions',
        { noteId, userId },
        {
          attempts: 1,
          priority: -1, // Low priority
          delay: 5000 // 5 second delay
        }
      );
    } catch (error) {
      console.error('Failed to queue version cleanup:', error);
    }
  }

  private async queueVersionAnalytics(noteId: string, userId: string) {
    try {
      await this.versionQueue.add(
        'update-version-analytics',
        { noteId, userId },
        {
          attempts: 1,
          priority: -2 // Very low priority
        }
      );
    } catch (error) {
      console.error('Failed to queue version analytics:', error);
    }
  }

  async getRecentVersions(userId: string, limit: number = 20) {
    const recentVersions = await this.prisma.noteVersion.findMany({
      where: {
        note: { ownerId: userId }
      },
      include: {
        note: {
          select: { id: true, title: true }
        },
        user: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return recentVersions.map(version => ({
      id: version.id,
      version: version.version,
      noteId: version.noteId,
      noteTitle: version.note.title,
      versionTitle: version.title,
      changeLog: version.changeLog,
      createdAt: version.createdAt,
      createdBy: version.user
    }));
  }

  // Auto-versioning on note updates - this will be called from NotesService
  async handleNoteUpdate(
    noteId: string, 
    userId: string, 
    oldNote: { title: string; content: string },
    newNote: { title: string; content: string }
  ) {
    // Only create version if there are significant changes
    const hasSignificantChanges = this.hasSignificantChanges(oldNote, newNote);
    
    if (hasSignificantChanges) {
      return this.createVersion(noteId, userId, {
        isAutomatic: true,
        changeType: 'minor'
      });
    }

    return { created: false, reason: 'No significant changes' };
  }
}
