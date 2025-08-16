import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

interface ShareAnalyticsJobData {
  shareLinkId: string;
  userId: string;
}

interface ShareViewJobData {
  shareLinkId: string;
  viewerInfo: {
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    userId?: string;
  };
}

@Injectable()
@Processor('share-analytics')
export class ShareProcessor extends WorkerHost {
  private readonly logger = new Logger(ShareProcessor.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'setup-share-analytics':
        return this.handleSetupShareAnalytics(job);
      case 'process-share-view':
        return this.handleProcessShareView(job);
      case 'cleanup-expired-shares':
        return this.handleCleanupExpiredShares(job);
      case 'generate-share-report':
        return this.handleGenerateShareReport(job);
      case 'process-geolocation':
        return this.handleProcessGeolocation(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleSetupShareAnalytics(job: Job<ShareAnalyticsJobData>) {
    const { shareLinkId, userId } = job.data;
    
    this.logger.log(`Setting up analytics for share link ${shareLinkId}`);
    
    try {
      // Initialize analytics tracking
      // This could involve setting up external analytics services
      // For now, we'll just log the setup
      
      this.logger.log(`Analytics setup completed for share link ${shareLinkId}`);
      
      return {
        shareLinkId,
        userId,
        message: 'Analytics setup completed successfully'
      };
    } catch (error) {
      this.logger.error(`Analytics setup failed for share link ${shareLinkId}:`, error);
      throw error;
    }
  }

  private async handleProcessShareView(job: Job<ShareViewJobData>) {
    const { shareLinkId, viewerInfo } = job.data;
    
    this.logger.log(`Processing share view for link ${shareLinkId}`);
    
    try {
      // Enhanced processing of share view
      // This could include geolocation, device detection, etc.
      
      // Example: Process geolocation from IP
      let country = null;
      if (viewerInfo.ipAddress && viewerInfo.ipAddress !== 'unknown') {
        country = await this.getCountryFromIP(viewerInfo.ipAddress);
      }

      // Update the share view with processed data
      const existingView = await this.prisma.shareView.findFirst({
        where: {
          shareLinkId,
          viewerIp: viewerInfo.ipAddress,
          viewedAt: {
            gte: new Date(Date.now() - 60 * 1000) // Within last minute
          }
        }
      });

      if (existingView) {
        // Update existing view with additional metadata
        await this.prisma.shareView.update({
          where: { id: existingView.id },
          data: {
            metadata: {
              ...existingView.metadata as any,
              country,
              processed: true
            }
          }
        });
      }

      this.logger.log(`Share view processing completed for link ${shareLinkId}`);
      
      return {
        shareLinkId,
        processed: true,
        country
      };
    } catch (error) {
      this.logger.error(`Share view processing failed for link ${shareLinkId}:`, error);
      throw error;
    }
  }

  private async handleCleanupExpiredShares(job: Job) {
    this.logger.log('Cleaning up expired share links');
    
    try {
      const now = new Date();
      
      // Find expired share links
      const expiredShares = await this.prisma.shareLink.findMany({
        where: {
          expiresAt: { lt: now }
        },
        select: { id: true, token: true }
      });

      if (expiredShares.length === 0) {
        this.logger.log('No expired share links found');
        return { deletedCount: 0 };
      }

      // Delete expired shares and their views
      const shareIds = expiredShares.map(s => s.id);
      
      // Delete views first (foreign key constraint)
      await this.prisma.shareView.deleteMany({
        where: { shareLinkId: { in: shareIds } }
      });

      // Delete share links
      const deletedCount = await this.prisma.shareLink.deleteMany({
        where: { id: { in: shareIds } }
      });

      this.logger.log(`Cleanup completed. Deleted ${deletedCount.count} expired share links`);

      return {
        deletedCount: deletedCount.count,
        expiredTokens: expiredShares.map(s => s.token)
      };
    } catch (error) {
      this.logger.error('Cleanup expired shares failed:', error);
      throw error;
    }
  }

  private async handleGenerateShareReport(job: Job) {
    const { userId, startDate, endDate } = job.data;
    
    this.logger.log(`Generating share report for user ${userId}`);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Get share links for user
      const shareLinks = await this.prisma.shareLink.findMany({
        where: {
          note: { ownerId: userId },
          createdAt: { gte: start, lte: end }
        },
        include: {
          note: { select: { title: true } },
          shareViews: {
            where: { viewedAt: { gte: start, lte: end } }
          }
        }
      });

      // Generate report data
      const report = {
        userId,
        period: { startDate, endDate },
        summary: {
          totalShares: shareLinks.length,
          totalViews: shareLinks.reduce((sum, link) => sum + link.shareViews.length, 0),
          averageViewsPerShare: 0,
          mostViewedNote: null as any,
          topReferrers: [] as any[]
        },
        shareDetails: shareLinks.map(link => ({
          id: link.id,
          noteTitle: link.note.title,
          token: link.token,
          viewCount: link.shareViews.length,
          isPublic: link.isPublic,
          createdAt: link.createdAt
        }))
      };

      // Calculate averages
      report.summary.averageViewsPerShare = shareLinks.length > 0 
        ? Math.round((report.summary.totalViews / shareLinks.length) * 100) / 100 
        : 0;

      // Find most viewed note
      if (shareLinks.length > 0) {
        const mostViewed = shareLinks.reduce((max, link) => 
          link.shareViews.length > max.shareViews.length ? link : max
        );
        report.summary.mostViewedNote = {
          title: mostViewed.note.title,
          views: mostViewed.shareViews.length
        };
      }

      // Aggregate referrers
      const referrerCounts = new Map();
      shareLinks.forEach(link => {
        link.shareViews.forEach(view => {
          const referrer = view.referrer || 'Direct';
          referrerCounts.set(referrer, (referrerCounts.get(referrer) || 0) + 1);
        });
      });

      report.summary.topReferrers = Array.from(referrerCounts.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      this.logger.log(`Share report generated for user ${userId}. ${report.summary.totalShares} shares, ${report.summary.totalViews} views`);

      return report;
    } catch (error) {
      this.logger.error(`Share report generation failed for user ${userId}:`, error);
      throw error;
    }
  }

  private async handleProcessGeolocation(job: Job) {
    const { shareViewId, ipAddress } = job.data;
    
    try {
      const country = await this.getCountryFromIP(ipAddress);
      
      if (country) {
        await this.prisma.shareView.update({
          where: { id: shareViewId },
          data: {
            metadata: {
              country,
              geoProcessed: true
            } as any
          }
        });
      }

      return { shareViewId, country };
    } catch (error) {
      this.logger.warn(`Geolocation processing failed for view ${shareViewId}:`, error);
      return { shareViewId, country: null };
    }
  }

  private async getCountryFromIP(ipAddress: string): Promise<string | null> {
    // Mock implementation - in production, you'd use a real geolocation service
    // like MaxMind GeoIP2, IP2Location, or a free service like ipapi.co
    
    if (ipAddress === 'unknown' || ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.')) {
      return null;
    }

    try {
      // Example with ipapi.co (free tier: 30k requests/month)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`https://ipapi.co/${ipAddress}/country_name/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const country = await response.text();
        return country.trim() || null;
      }
    } catch (error) {
      this.logger.warn(`IP geolocation failed for ${ipAddress}:`, error);
    }

    return null;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Share analytics job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Share analytics job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) {
      this.logger.log(`📊 Share analytics job ${job.id} progress: ${progress}%`);
    }
  }
}
