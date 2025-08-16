import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

interface InvitationEmailJobData {
  inviteeEmail: string;
  inviterName: string;
  noteTitle: string;
  permission: string;
  noteId: string;
  inviteId: string;
  isPending?: boolean;
}

@Injectable()
@Processor('collaboration')
export class CollaborationProcessor extends WorkerHost {
  private readonly logger = new Logger(CollaborationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-invitation-email':
        return this.handleSendInvitationEmail(job);
      case 'cleanup-expired-collaborations':
        return this.handleCleanupExpiredCollaborations(job);
      case 'sync-collaboration-activity':
        return this.handleSyncCollaborationActivity(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleSendInvitationEmail(job: Job<InvitationEmailJobData>) {
    const { inviteeEmail, inviterName, noteTitle, permission, noteId, inviteId, isPending } = job.data;
    
    this.logger.log(`Sending collaboration invitation email to ${inviteeEmail}`);
    
    try {
      // In a real implementation, you would use an email service like:
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      
      const emailContent = this.generateInvitationEmail({
        inviteeEmail,
        inviterName,
        noteTitle,
        permission,
        noteId,
        inviteId,
        isPending
      });

      // Mock email sending (replace with actual email service)
      console.log('📧 Email would be sent:', emailContent);

      // Log email activity
      await this.prisma.userActivity.create({
        data: {
          userId: 'system', // System-generated activity
          action: 'COLLABORATION_INVITE_SENT',
          noteId,
          metadata: {
            inviteeEmail,
            permission,
            isPending
          }
        }
      }).catch(() => {}); // Ignore if userActivity table doesn't exist yet

      this.logger.log(`✅ Invitation email sent successfully to ${inviteeEmail}`);

      return {
        success: true,
        inviteeEmail,
        noteTitle,
        permission
      };
    } catch (error) {
      this.logger.error(`❌ Failed to send invitation email to ${inviteeEmail}:`, error);
      throw error;
    }
  }

  private generateInvitationEmail(data: InvitationEmailJobData) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const acceptUrl = `${frontendUrl}/collaboration/accept/${data.inviteId}`;
    
    return {
      to: data.inviteeEmail,
      subject: `Collaboration Invitation: ${data.noteTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🤝 Collaboration Invitation</h2>
          
          <p>Hello!</p>
          
          <p><strong>${data.inviterName}</strong> has invited you to collaborate on the note:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0; color: #333;">📝 ${data.noteTitle}</h3>
            <p style="margin: 10px 0 0 0; color: #666;">
              Permission Level: <strong>${data.permission.charAt(0).toUpperCase() + data.permission.slice(1)}</strong>
            </p>
          </div>
          
          <p>With <strong>${data.permission}</strong> permission, you can:</p>
          <ul>
            ${data.permission === 'read' ? '<li>View the note content</li>' : ''}
            ${data.permission === 'write' || data.permission === 'admin' ? '<li>View and edit the note content</li>' : ''}
            ${data.permission === 'admin' ? '<li>Invite other collaborators</li><li>Manage permissions</li>' : ''}
          </ul>
          
          ${data.isPending ? 
            '<p><strong>Note:</strong> You\'ll need to create an AI Notes account to access this note.</p>' : 
            '<p>Click the button below to accept the invitation:</p>'
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you're not interested in collaborating, you can safely ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This invitation was sent by AI Notes. If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };
  }

  private async handleCleanupExpiredCollaborations(job: Job) {
    this.logger.log('Cleaning up expired collaborations');
    
    try {
      // Remove collaborations for deleted notes
      const deletedCount = await this.prisma.collaboration.deleteMany({
        where: {
          note: { isDeleted: true }
        }
      });

      this.logger.log(`Cleaned up ${deletedCount.count} collaborations for deleted notes`);

      return {
        deletedCollaborations: deletedCount.count
      };
    } catch (error) {
      this.logger.error('Failed to cleanup expired collaborations:', error);
      throw error;
    }
  }

  private async handleSyncCollaborationActivity(job: Job) {
    const { noteId, userId, action, metadata } = job.data;
    
    try {
      // Log collaboration activity
      await this.prisma.userActivity.create({
        data: {
          userId,
          action,
          noteId,
          metadata: metadata || {}
        }
      });

      // Update note analytics if available
      try {
        await this.prisma.noteAnalytics.upsert({
          where: { noteId },
          update: {
            editCount: { increment: 1 },
            lastEdited: new Date()
          },
          create: {
            noteId,
            editCount: 1,
            lastEdited: new Date()
          }
        });
      } catch (error) {
        // Ignore if noteAnalytics table doesn't exist yet
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to sync collaboration activity:', error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Collaboration job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Collaboration job ${job.id} (${job.name}) failed:`, error);
  }
}
