import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { NotesService } from '../notes/notes.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CreateShareLinkOptions {
  isPublic: boolean;
  expiresAt?: Date;
  allowComments?: boolean;
  requireAuth?: boolean;
  maxViews?: number;
  password?: string;
}

export interface ShareLinkDetails {
  id: string;
  token: string;
  isPublic: boolean;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  note: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  owner: {
    id: string;
    name: string;
    image?: string;
  };
  analytics: {
    viewCount: number;
    uniqueViews: number;
    lastAccessed: Date | null;
  };
  settings: {
    allowComments: boolean;
    requireAuth: boolean;
    maxViews?: number;
    hasPassword: boolean;
  };
}

export interface ShareLinkAnalytics {
  id: string;
  viewCount: number;
  uniqueViews: number;
  viewsByDay: { date: string; views: number }[];
  topReferrers: { source: string; count: number }[];
  geographicData: { country: string; count: number }[];
  deviceTypes: { type: string; count: number }[];
}

@Injectable()
export class ShareService {
  constructor(
    private prisma: PrismaService,
    private notesService: NotesService,
    private configService: ConfigService,
    @InjectQueue('share-analytics') private analyticsQueue: Queue,
  ) {}

  async createShareLink(
    noteId: string, 
    userId: string, 
    options: CreateShareLinkOptions
  ) {
    // Verify note ownership
    const note = await this.notesService.findOne(noteId, userId);
    
    // Check if share link already exists
    const existingLink = await this.prisma.shareLink.findFirst({
      where: { noteId }
    });

    if (existingLink) {
      return this.updateShareLink(existingLink.id, userId, options);
    }

    // Generate secure token
    const token = this.generateSecureToken();

    // Hash password if provided
    let passwordHash: string | null = null;
    if (options.password) {
      passwordHash = crypto.createHash('sha256')
        .update(options.password)
        .digest('hex');
    }

    const shareLink = await this.prisma.shareLink.create({
      data: {
        noteId,
        token,
        isPublic: options.isPublic,
        expiresAt: options.expiresAt,
        allowComments: options.allowComments || false,
        requireAuth: options.requireAuth || false,
        maxViews: options.maxViews,
        passwordHash,
        settings: {
          createdBy: userId,
          allowDownload: true,
          showAuthor: options.isPublic,
          enableAnalytics: true
        } as any
      },
      include: {
        note: {
          select: { title: true }
        }
      }
    });

    // Queue analytics setup
    await this.queueAnalyticsSetup(shareLink.id, userId);

    // Create notification if needed
    if (options.isPublic) {
      await this.createShareNotification(noteId, userId, 'created');
    }

    return {
      success: true,
      shareLink: {
        id: shareLink.id,
        token: shareLink.token,
        url: this.generateShareUrl(shareLink.token),
        isPublic: shareLink.isPublic,
        expiresAt: shareLink.expiresAt,
        settings: {
          allowComments: shareLink.allowComments,
          requireAuth: shareLink.requireAuth,
          maxViews: shareLink.maxViews,
          hasPassword: !!passwordHash
        }
      },
      message: 'Share link created successfully'
    };
  }

  async updateShareLink(
    shareLinkId: string,
    userId: string,
    options: Partial<CreateShareLinkOptions>
  ) {
    // Verify ownership through note
    const shareLink = await this.prisma.shareLink.findFirst({
      where: {
        id: shareLinkId,
        note: { ownerId: userId }
      }
    });

    if (!shareLink) {
      throw new NotFoundException('Share link not found or not owned by user');
    }

    // Prepare update data
    const updateData: any = {};
    
    if (options.isPublic !== undefined) updateData.isPublic = options.isPublic;
    if (options.expiresAt !== undefined) updateData.expiresAt = options.expiresAt;
    if (options.allowComments !== undefined) updateData.allowComments = options.allowComments;
    if (options.requireAuth !== undefined) updateData.requireAuth = options.requireAuth;
    if (options.maxViews !== undefined) updateData.maxViews = options.maxViews;

    // Handle password change
    if (options.password !== undefined) {
      updateData.passwordHash = options.password 
        ? crypto.createHash('sha256').update(options.password).digest('hex')
        : null;
    }

    const updated = await this.prisma.shareLink.update({
      where: { id: shareLinkId },
      data: updateData,
      include: {
        note: { select: { title: true } }
      }
    });

    return {
      success: true,
      shareLink: {
        id: updated.id,
        token: updated.token,
        url: this.generateShareUrl(updated.token),
        isPublic: updated.isPublic,
        expiresAt: updated.expiresAt,
        updatedAt: updated.updatedAt
      },
      message: 'Share link updated successfully'
    };
  }

  async deleteShareLink(shareLinkId: string, userId: string) {
    const shareLink = await this.prisma.shareLink.findFirst({
      where: {
        id: shareLinkId,
        note: { ownerId: userId }
      }
    });

    if (!shareLink) {
      throw new NotFoundException('Share link not found or not owned by user');
    }

    await this.prisma.shareLink.delete({
      where: { id: shareLinkId }
    });

    // Create notification
    await this.createShareNotification(shareLink.noteId, userId, 'deleted');

    return {
      success: true,
      message: 'Share link deleted successfully'
    };
  }

  async getShareLinksByUser(userId: string) {
    const shareLinks = await this.prisma.shareLink.findMany({
      where: {
        note: { ownerId: userId }
      },
      include: {
        note: {
          select: { id: true, title: true, updatedAt: true }
        },
        _count: {
          select: { shareViews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return shareLinks.map(link => ({
      id: link.id,
      token: link.token,
      url: this.generateShareUrl(link.token),
      isPublic: link.isPublic,
      isActive: this.isShareLinkActive(link),
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      note: link.note,
      viewCount: link._count.shareViews,
      settings: {
        allowComments: link.allowComments,
        requireAuth: link.requireAuth,
        maxViews: link.maxViews,
        hasPassword: !!link.passwordHash
      }
    }));
  }

  async getSharedNoteByToken(
    token: string, 
    password?: string,
    viewerInfo?: {
      ipAddress: string;
      userAgent: string;
      referrer?: string;
      userId?: string;
    }
  ): Promise<ShareLinkDetails> {
    const shareLink = await this.prisma.shareLink.findUnique({
      where: { token },
      include: {
        note: {
          include: {
            owner: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        shareViews: {
          select: { id: true, viewedAt: true, viewerIp: true },
          orderBy: { viewedAt: 'desc' },
          take: 100
        }
      }
    });

    if (!shareLink) {
      throw new NotFoundException('Share link not found');
    }

    // Check if link is active
    if (!this.isShareLinkActive(shareLink)) {
      throw new ForbiddenException('Share link has expired or reached maximum views');
    }

    // Check password if required
    if (shareLink.passwordHash && password) {
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      if (passwordHash !== shareLink.passwordHash) {
        throw new ForbiddenException('Invalid password');
      }
    } else if (shareLink.passwordHash && !password) {
      throw new ForbiddenException('Password required');
    }

    // Check authentication requirement
    if (shareLink.requireAuth && !viewerInfo?.userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Record view
    if (viewerInfo) {
      await this.recordView(shareLink.id, viewerInfo);
    }

    // Calculate analytics
    const analytics = this.calculateAnalytics(shareLink.shareViews);

    return {
      id: shareLink.id,
      token: shareLink.token,
      isPublic: shareLink.isPublic,
      isActive: true,
      expiresAt: shareLink.expiresAt,
      createdAt: shareLink.createdAt,
      note: {
        id: shareLink.note.id,
        title: shareLink.note.title,
        content: shareLink.note.content,
        tags: shareLink.note.tags,
        createdAt: shareLink.note.createdAt,
        updatedAt: shareLink.note.updatedAt,
      },
      owner: shareLink.note.owner,
      analytics,
      settings: {
        allowComments: shareLink.allowComments,
        requireAuth: shareLink.requireAuth,
        maxViews: shareLink.maxViews,
        hasPassword: !!shareLink.passwordHash
      }
    };
  }

  async getShareLinkAnalytics(shareLinkId: string, userId: string): Promise<ShareLinkAnalytics> {
    const shareLink = await this.prisma.shareLink.findFirst({
      where: {
        id: shareLinkId,
        note: { ownerId: userId }
      },
      include: {
        shareViews: {
          orderBy: { viewedAt: 'desc' }
        }
      }
    });

    if (!shareLink) {
      throw new NotFoundException('Share link not found');
    }

    const analytics = this.calculateDetailedAnalytics(shareLink.shareViews);

    return {
      id: shareLink.id,
      ...analytics
    };
  }

  async toggleShareLinkStatus(shareLinkId: string, userId: string) {
    const shareLink = await this.prisma.shareLink.findFirst({
      where: {
        id: shareLinkId,
        note: { ownerId: userId }
      }
    });

    if (!shareLink) {
      throw new NotFoundException('Share link not found');
    }

    // Toggle by setting/removing expiration
    const newExpiresAt = shareLink.expiresAt ? null : new Date();

    const updated = await this.prisma.shareLink.update({
      where: { id: shareLinkId },
      data: { expiresAt: newExpiresAt }
    });

    const action = newExpiresAt ? 'disabled' : 'enabled';

    return {
      success: true,
      isActive: !newExpiresAt,
      message: `Share link ${action} successfully`
    };
  }

  async regenerateShareToken(shareLinkId: string, userId: string) {
    const shareLink = await this.prisma.shareLink.findFirst({
      where: {
        id: shareLinkId,
        note: { ownerId: userId }
      }
    });

    if (!shareLink) {
      throw new NotFoundException('Share link not found');
    }

    const newToken = this.generateSecureToken();

    const updated = await this.prisma.shareLink.update({
      where: { id: shareLinkId },
      data: { token: newToken }
    });

    // Create notification
    await this.createShareNotification(shareLink.noteId, userId, 'regenerated');

    return {
      success: true,
      newToken: updated.token,
      newUrl: this.generateShareUrl(updated.token),
      message: 'Share token regenerated successfully'
    };
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateShareUrl(token: string): string {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    return `${frontendUrl}/share/${token}`;
  }

  private isShareLinkActive(shareLink: any): boolean {
    // Check expiration
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return false;
    }

    // Check max views
    if (shareLink.maxViews && shareLink.shareViews?.length >= shareLink.maxViews) {
      return false;
    }

    return true;
  }

  private async recordView(shareLinkId: string, viewerInfo: any) {
    try {
      // Check if this is a unique view (same IP within 24 hours)
      const existingView = await this.prisma.shareView.findFirst({
        where: {
          shareLinkId,
          viewerIp: viewerInfo.ipAddress,
          viewedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      // Always record the view, but mark if it's unique
      await this.prisma.shareView.create({
        data: {
          shareLinkId,
          viewerIp: viewerInfo.ipAddress,
          viewerAgent: viewerInfo.userAgent,
          referrer: viewerInfo.referrer,
          viewerId: viewerInfo.userId,
          isUnique: !existingView,
          viewedAt: new Date(),
          metadata: {
            country: null, // Would be populated by IP geolocation
            device: this.parseDeviceType(viewerInfo.userAgent)
          } as any
        }
      });

      // Queue detailed analytics processing
      await this.queueAnalyticsProcessing(shareLinkId, viewerInfo);
    } catch (error) {
      console.error('Failed to record share view:', error);
      // Don't throw error, as view recording shouldn't block access
    }
  }

  private calculateAnalytics(shareViews: any[]) {
    const uniqueIps = new Set(shareViews.map(v => v.viewerIp));
    
    return {
      viewCount: shareViews.length,
      uniqueViews: uniqueIps.size,
      lastAccessed: shareViews.length > 0 ? shareViews[0].viewedAt : null,
    };
  }

  private calculateDetailedAnalytics(shareViews: any[]): Omit<ShareLinkAnalytics, 'id'> {
    const viewCount = shareViews.length;
    const uniqueIps = new Set(shareViews.map(v => v.viewerIp));
    const uniqueViews = uniqueIps.size;

    // Views by day (last 30 days)
    const viewsByDay = this.groupViewsByDay(shareViews);

    // Top referrers
    const referrerCounts = shareViews.reduce((acc, view) => {
      const referrer = view.referrer || 'Direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {});

    const topReferrers = Object.entries(referrerCounts)
      .map(([source, count]) => ({ source, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Device types
    const deviceCounts = shareViews.reduce((acc, view) => {
      const device = view.metadata?.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    const deviceTypes = Object.entries(deviceCounts)
      .map(([type, count]) => ({ type, count: count as number }))
      .sort((a, b) => b.count - a.count);

    return {
      viewCount,
      uniqueViews,
      viewsByDay,
      topReferrers,
      geographicData: [], // Would be populated with actual geolocation data
      deviceTypes
    };
  }

  private groupViewsByDay(shareViews: any[]) {
    const viewsByDay = new Map();
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Initialize with zeros for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      viewsByDay.set(dateStr, 0);
    }

    // Count actual views
    shareViews.forEach(view => {
      if (view.viewedAt >= last30Days) {
        const dateStr = view.viewedAt.toISOString().split('T')[0];
        if (viewsByDay.has(dateStr)) {
          viewsByDay.set(dateStr, viewsByDay.get(dateStr) + 1);
        }
      }
    });

    return Array.from(viewsByDay.entries()).map(([date, views]) => ({
      date,
      views
    }));
  }

  private parseDeviceType(userAgent: string): string {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  private async queueAnalyticsSetup(shareLinkId: string, userId: string) {
    try {
      await this.analyticsQueue.add(
        'setup-share-analytics',
        { shareLinkId, userId },
        {
          attempts: 2,
          priority: -1 // Low priority
        }
      );
    } catch (error) {
      console.error('Failed to queue analytics setup:', error);
    }
  }

  private async queueAnalyticsProcessing(shareLinkId: string, viewerInfo: any) {
    try {
      await this.analyticsQueue.add(
        'process-share-view',
        { shareLinkId, viewerInfo },
        {
          attempts: 1,
          priority: -1 // Low priority
        }
      );
    } catch (error) {
      console.error('Failed to queue analytics processing:', error);
    }
  }

  private async createShareNotification(noteId: string, userId: string, action: string) {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          title: `Share Link ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          message: `Share link for your note has been ${action}`,
          type: 'SYSTEM',
          noteId
        }
      });
    } catch (error) {
      console.error('Failed to create share notification:', error);
    }
  }

  async getShareStatsSummary(userId: string) {
    const [totalShares, activeShares, totalViews, recentViews] = await Promise.all([
      this.prisma.shareLink.count({
        where: { note: { ownerId: userId } }
      }),
      this.prisma.shareLink.count({
        where: {
          note: { ownerId: userId },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }),
      this.prisma.shareView.count({
        where: {
          shareLink: {
            note: { ownerId: userId }
          }
        }
      }),
      this.prisma.shareView.count({
        where: {
          shareLink: {
            note: { ownerId: userId }
          },
          viewedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    return {
      totalShares,
      activeShares,
      inactiveShares: totalShares - activeShares,
      totalViews,
      recentViews
    };
  }
}
