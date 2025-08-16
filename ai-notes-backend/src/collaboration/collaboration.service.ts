import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { NotesService } from '../notes/notes.service';

export interface CollaborationInvite {
  id: string;
  noteId: string;
  inviteeEmail: string;
  permission: 'READ' | 'WRITE' | 'ADMIN';
  inviterName: string;
  noteTitle: string;
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
}

export interface ActiveCollaborator {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  permission: 'READ' | 'WRITE' | 'ADMIN';
  lastActive: Date;
  isOnline: boolean;
  cursor?: {
    line: number;
    column: number;
    selection?: { start: number; end: number };
  };
}

@Injectable()
export class CollaborationService {
  private activeUsers = new Map<string, { noteId: string; userId: string; socketId: string; lastSeen: Date }>();
  private noteCursors = new Map<string, Map<string, any>>(); // noteId -> userId -> cursor

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private notesService: NotesService,
    @InjectQueue('collaboration') private collaborationQueue: Queue,
  ) {
    // Clean up inactive users every 30 seconds
    setInterval(() => this.cleanupInactiveUsers(), 30000);
  }

  async inviteCollaborator(
    noteId: string,
    inviterUserId: string,
    inviteeEmail: string,
    permission: 'READ' | 'WRITE' | 'ADMIN'
  ) {
    // Verify note ownership and current user has ADMIN permission
    const note = await this.notesService.findOne(noteId, inviterUserId);
    const currentCollaboration = await this.getUserPermission(noteId, inviterUserId);
    
    if (currentCollaboration !== 'ADMIN' && note.ownerId !== inviterUserId) {
      throw new ForbiddenException('Only admins can invite collaborators');
    }

    // Check if invitee exists
    const invitee = await this.usersService.findByEmail(inviteeEmail);
    if (!invitee) {
      // Queue invitation to be sent when user registers
      return this.createPendingInvitation(noteId, inviterUserId, inviteeEmail, permission);
    }

    // Check if already collaborating
    const existing = await this.prisma.collaboration.findUnique({
      where: {
        noteId_userId: { noteId, userId: invitee.id }
      }
    });

    if (existing) {
      throw new BadRequestException('User is already a collaborator on this note');
    }

    // Create collaboration
    const collaboration = await this.prisma.collaboration.create({
      data: {
        noteId,
        userId: invitee.id,
        permission: permission.toUpperCase() as any,
        invitedBy: inviterUserId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        inviter: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Send notification
    await this.sendCollaborationNotification(collaboration, note.title);

    // Queue invitation email
    await this.queueInvitationEmail({
      inviteeEmail,
      inviterName: collaboration.inviter.name || collaboration.inviter.email,
      noteTitle: note.title,
      permission,
      noteId,
      inviteId: collaboration.id
    });

    return {
      success: true,
      collaboration: {
        id: collaboration.id,
        user: collaboration.user,
        permission: collaboration.permission.toLowerCase(),
        createdAt: collaboration.createdAt
      },
      message: 'Collaborator invited successfully'
    };
  }

  async removeCollaborator(noteId: string, collaboratorUserId: string, removerUserId: string) {
    // Verify permissions
    const removerPermission = await this.getUserPermission(noteId, removerUserId);
    const note = await this.notesService.findOne(noteId, removerUserId);
    
    if (removerPermission !== 'ADMIN' && note.ownerId !== removerUserId) {
      throw new ForbiddenException('Only admins can remove collaborators');
    }

    // Cannot remove note owner
    if (collaboratorUserId === note.ownerId) {
      throw new BadRequestException('Cannot remove note owner');
    }

    const deleted = await this.prisma.collaboration.deleteMany({
      where: {
        noteId,
        userId: collaboratorUserId
      }
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Collaboration not found');
    }

    // Send notification to removed user
    const removedUser = await this.usersService.findById(collaboratorUserId);
    if (removedUser) {
      await this.prisma.notification.create({
        data: {
          userId: collaboratorUserId,
          title: 'Removed from Collaboration',
          message: `You have been removed from collaboration on "${note.title}"`,
          type: 'COLLABORATION',
          noteId,
        }
      });
    }

    return { success: true, message: 'Collaborator removed successfully' };
  }

  async updateCollaboratorPermission(
    noteId: string,
    collaboratorUserId: string,
    newPermission: 'READ' | 'WRITE' | 'ADMIN',
    updaterUserId: string
  ) {
    // Verify permissions
    const updaterPermission = await this.getUserPermission(noteId, updaterUserId);
    const note = await this.notesService.findOne(noteId, updaterUserId);
    
    if (updaterPermission !== 'ADMIN' && note.ownerId !== updaterUserId) {
      throw new ForbiddenException('Only admins can update permissions');
    }

    // Cannot change owner permissions
    if (collaboratorUserId === note.ownerId) {
      throw new BadRequestException('Cannot change owner permissions');
    }

    const updated = await this.prisma.collaboration.updateMany({
      where: {
        noteId,
        userId: collaboratorUserId
      },
      data: {
        permission: newPermission.toUpperCase() as any
      }
    });

    if (updated.count === 0) {
      throw new NotFoundException('Collaboration not found');
    }

    return { success: true, message: 'Permission updated successfully' };
  }

  async getCollaborators(noteId: string, userId: string): Promise<ActiveCollaborator[]> {
    // Verify user has access to note
    await this.verifyNoteAccess(noteId, userId);

    const collaborations = await this.prisma.collaboration.findMany({
      where: { noteId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    // Include note owner
    const note = await this.prisma.note.findFirst({
      where: { id: noteId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    const collaborators: ActiveCollaborator[] = [];

    // Add owner
    if (note) {
      const ownerActive = this.isUserActive(noteId, note.ownerId);
      const ownerCursor = this.getUserCursor(noteId, note.ownerId);
      
      collaborators.push({
        id: note.ownerId,
        user: note.owner,
        permission: 'ADMIN',
        lastActive: ownerActive?.lastSeen || new Date(),
        isOnline: !!ownerActive,
        cursor: ownerCursor
      });
    }

    // Add collaborators
    for (const collab of collaborations) {
      const userActive = this.isUserActive(noteId, collab.userId);
      const userCursor = this.getUserCursor(noteId, collab.userId);
      
      collaborators.push({
        id: collab.userId,
        user: collab.user,
        permission: collab.permission.toLowerCase() as any,
        lastActive: userActive?.lastSeen || collab.createdAt,
        isOnline: !!userActive,
        cursor: userCursor
      });
    }

    return collaborators;
  }

  async getUserPermission(noteId: string, userId: string): Promise<'READ' | 'WRITE' | 'ADMIN' | null> {
    // Check if user is owner
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId }
    });

    if (note) return 'ADMIN';

    // Check collaboration
    const collaboration = await this.prisma.collaboration.findUnique({
      where: {
        noteId_userId: { noteId, userId }
      }
    });

    return collaboration ? collaboration.permission.toLowerCase() as any : null;
  }

  async verifyNoteAccess(noteId: string, userId: string) {
    const permission = await this.getUserPermission(noteId, userId);
    if (!permission) {
      throw new ForbiddenException('You do not have access to this note');
    }
    return permission;
  }

  async verifyWriteAccess(noteId: string, userId: string) {
    const permission = await this.getUserPermission(noteId, userId);
    if (!permission || permission === 'READ') {
      throw new ForbiddenException('You do not have write access to this note');
    }
    return permission;
  }

  // Real-time collaboration methods
  async userJoined(noteId: string, userId: string, socketId: string) {
    // Verify access
    await this.verifyNoteAccess(noteId, userId);

    this.activeUsers.set(socketId, {
      noteId,
      userId,
      socketId,
      lastSeen: new Date()
    });

    // Initialize cursor map for note if doesn't exist
    if (!this.noteCursors.has(noteId)) {
      this.noteCursors.set(noteId, new Map());
    }

    return {
      success: true,
      collaborators: await this.getCollaborators(noteId, userId)
    };
  }

  async userLeft(socketId: string) {
    const user = this.activeUsers.get(socketId);
    if (user) {
      this.activeUsers.delete(socketId);
      
      // Clean up cursor
      const noteCursors = this.noteCursors.get(user.noteId);
      if (noteCursors) {
        noteCursors.delete(user.userId);
      }
    }
  }

  async updateUserCursor(socketId: string, cursor: any) {
    const user = this.activeUsers.get(socketId);
    if (user) {
      user.lastSeen = new Date();
      
      const noteCursors = this.noteCursors.get(user.noteId);
      if (noteCursors) {
        noteCursors.set(user.userId, cursor);
      }
    }
  }

  async updateUserActivity(socketId: string) {
    const user = this.activeUsers.get(socketId);
    if (user) {
      user.lastSeen = new Date();
    }
  }

  getActiveUsersForNote(noteId: string) {
    const activeUsers = [];
    for (const [socketId, user] of this.activeUsers.entries()) {
      if (user.noteId === noteId) {
        activeUsers.push({
          userId: user.userId,
          socketId,
          lastSeen: user.lastSeen
        });
      }
    }
    return activeUsers;
  }

  private isUserActive(noteId: string, userId: string) {
    for (const [socketId, user] of this.activeUsers.entries()) {
      if (user.noteId === noteId && user.userId === userId) {
        return user;
      }
    }
    return null;
  }

  private getUserCursor(noteId: string, userId: string) {
    const noteCursors = this.noteCursors.get(noteId);
    return noteCursors?.get(userId);
  }

  private cleanupInactiveUsers() {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [socketId, user] of this.activeUsers.entries()) {
      if (now.getTime() - user.lastSeen.getTime() > timeout) {
        this.activeUsers.delete(socketId);
      }
    }
  }

  private async createPendingInvitation(
    noteId: string,
    inviterUserId: string,
    inviteeEmail: string,
    permission: 'READ' | 'WRITE' | 'ADMIN'
  ) {
    // Store pending invitation (could use a separate table or cache)
    const note = await this.prisma.note.findFirst({
      where: { id: noteId },
      include: { owner: { select: { name: true, email: true } } }
    });

    await this.queueInvitationEmail({
      inviteeEmail,
      inviterName: note.owner.name || note.owner.email,
      noteTitle: note.title,
      permission,
      noteId,
      inviteId: 'pending',
      isPending: true
    });

    return {
      success: true,
      message: 'Invitation will be sent when user registers',
      pendingInvitation: {
        email: inviteeEmail,
        permission,
        noteTitle: note.title
      }
    };
  }

  private async sendCollaborationNotification(collaboration: any, noteTitle: string) {
    await this.prisma.notification.create({
      data: {
        userId: collaboration.userId,
        title: 'Collaboration Invitation',
        message: `${collaboration.inviter.name || collaboration.inviter.email} invited you to collaborate on "${noteTitle}"`,
        type: 'COLLABORATION',
        noteId: collaboration.noteId,
      }
    });
  }

  private async queueInvitationEmail(data: {
    inviteeEmail: string;
    inviterName: string;
    noteTitle: string;
    permission: string;
    noteId: string;
    inviteId: string;
    isPending?: boolean;
  }) {
    try {
      await this.collaborationQueue.add(
        'send-invitation-email',
        data,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      );
    } catch (error) {
      console.error('Failed to queue invitation email:', error);
    }
  }

  async getCollaboratedNotes(userId: string) {
    const collaborations = await this.prisma.collaboration.findMany({
      where: { userId },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            owner: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return collaborations.map(collab => ({
      id: collab.id,
      note: collab.note,
      permission: collab.permission.toLowerCase(),
      joinedAt: collab.createdAt,
      isOwner: false
    }));
  }

  async getCollaborationStats(userId: string) {
    const [ownedNotes, collaboratedNotes, totalCollaborators] = await Promise.all([
      // Notes owned by user
      this.prisma.note.count({
        where: { ownerId: userId, isDeleted: false }
      }),
      // Notes user collaborates on
      this.prisma.collaboration.count({
        where: { userId }
      }),
      // Total collaborators on user's notes
      this.prisma.collaboration.count({
        where: {
          note: { ownerId: userId }
        }
      })
    ]);

    return {
      ownedNotes,
      collaboratedNotes,
      totalCollaborators
    };
  }
}
