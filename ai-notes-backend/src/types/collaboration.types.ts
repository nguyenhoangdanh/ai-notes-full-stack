import { IsEmail, IsEnum } from 'class-validator';

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

export interface InvitationEmailJobData {
  inviteeEmail: string;
  inviterName: string;
  noteTitle: string;
  permission: string;
  noteId: string;
  inviteId: string;
  isPending?: boolean;
}