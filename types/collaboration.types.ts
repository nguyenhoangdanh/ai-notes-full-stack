// Collaboration types
export interface InviteCollaboratorDto {
  email: string;
  permission: "read" | "write" | "admin";
}

export interface PendingInvitation {
  success: boolean;
  message: string;
  pendingInvitation: {
    email: string;
    permission: "READ" | "WRITE" | "ADMIN";
    noteTitle: string;
  };
}

export interface Collaboration {
  id: string;
  note: {
    id: string;
    title: string;
    updatedAt: Date;
    owner: {
      email: string;
      id: string;
      name: string;
      image: string;
    };
  };
  permission: string;
  joinedAt: Date;
  isOwner: boolean;
}

export interface MyCollaborationResponse {
  success: boolean;
  collaborations: Collaboration[];
  count?: number;
  error?: any;
}

export interface GetCollaborationStatsResponse {
  success: boolean;
  stats: {
    ownedNotes: number;
    collaboratedNotes: number;
    totalCollaborators: number;
  };
}

export interface JoinCollaborationResponse {
  success: boolean;
  collaborators: ActiveCollaborator[];
  message?: any;
}

export interface AcceptedInvitation {
  success: boolean;
  collaboration: {
    id: string;
    user: {
      email: string;
      id: string;
      name: string;
      image: string;
    };
    permission: string;
    createdAt: Date;
  };
  message: string;
}

export interface InvitationError {
  success: boolean;
  message: string;
}

export type InviteCollaboratorResponse =
  | PendingInvitation
  | AcceptedInvitation
  | InvitationError;

export interface UpdatePermissionDto {
  permission: "read" | "write" | "admin";
}

export interface Collaborator {
  id: string;
  userId: string;
  noteId: string;
  permission: "READ" | "COMMENT" | "EDIT" | "ADMIN";
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  invitedAt: string;
  acceptedAt?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

export interface ActiveCollaborator {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  permission: "READ" | "WRITE" | "ADMIN";
  lastActive: Date;
  isOnline: boolean;
  cursor?: {
    line: number;
    column: number;
    selection?: { start: number; end: number };
  };
}

export interface ICollaboratorError {
  success: boolean;
  collaborators: any[];
  error: any;
  noteId?: undefined;
  count?: undefined;
}

export interface ICollaboratorSuccess {
  success: boolean;
  noteId: string;
  collaborators: ActiveCollaborator[];
  count: number;
  error?: any;
}

export type CollaborationResponse = ICollaboratorSuccess | ICollaboratorError;

export interface GetPermissionResponse {
  success: boolean;
  noteId?: string;
  permission: "READ" | "WRITE" | "ADMIN";
  hasAccess: boolean;
  error?: any;
}

export interface CollaborationStats {
  totalCollaborations: number;
  activeCollaborations: number;
  pendingInvitations: number;
  sharedNotes: number;
}

export interface CursorUpdate {
  socketId: string;
  cursor: {
    line: number;
    column: number;
    selection?: { start: number; end: number };
  };
}



// Activities types
export interface Activity {
  id: string;
  userId: string;
  type:
    | "NOTE_CREATED"
    | "NOTE_UPDATED"
    | "NOTE_DELETED"
    | "WORKSPACE_CREATED"
    | "COLLABORATION_INVITED"
    | "EXPORT_COMPLETED";
  entityId: string;
  entityType: "NOTE" | "WORKSPACE" | "COLLABORATION";
  metadata: Record<string, any>;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ActivityInsights {
  mostActiveHours: Array<{ hour: number; count: number }>;
  mostActiveDays: Array<{ day: string; count: number }>;
  activityTrends: Array<{ date: string; count: number }>;
  topActivities: Array<{ type: string; count: number }>;
}

export interface ActivityFeed {
  activities: Activity[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ActivityStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalCount: number;
  streakDays: number;
  averagePerDay: number;
}

export interface TrackActivityDto {
  type: Activity["type"];
  entityId: string;
  entityType: Activity["entityType"];
  metadata?: Record<string, any>;
}

export interface ProductivityHeatmap {
  date: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// Tags types
export interface CreateTagDto {
  name: string;
  color?: string;
  description?: string;
  parentId?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
  description?: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  parentId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  parent?: Tag;
  children?: Tag[];
  _count?: {
    notes: number;
    children: number;
  };
}

export interface TagHierarchy {
  id: string;
  name: string;
  color?: string;
  level: number;
  children: TagHierarchy[];
  noteCount: number;
}

export interface TagAnalytics {
  totalTags: number;
  averageTagsPerNote: number;
  mostUsedTags: Array<{
    tag: Tag;
    usage: number;
  }>;
  recentlyCreated: Tag[];
  unusedTags: Tag[];
}

export interface TagSuggestion {
  tag: string;
  confidence: number;
  existing: boolean;
  tagId?: string;
}

export interface BulkTagOperationDto {
  operation: "DELETE" | "MERGE" | "RENAME";
  tagIds: string[];
  targetTagId?: string; // For merge operation
  newName?: string; // For rename operation
}
