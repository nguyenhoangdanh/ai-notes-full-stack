// Share types
export interface CreateShareLinkDto {
  isPublic: boolean;
  expiresAt?: string;
  allowComments?: boolean;
  requireAuth?: boolean;
  maxViews?: number;
  password?: string;
}

export interface UpdateShareLinkDto {
  expiresAt?: string;
  password?: string;
  allowDownload?: boolean;
  allowPrint?: boolean;
  trackViews?: boolean;
  isActive?: boolean;
}

export interface ShareLink {
  id: string;
  token: string;
  url: string;
  isPublic: boolean;
  expiresAt?: Date;
  updatedAt?: Date;
  settings?: {
    allowComments?: boolean;
    requireAuth?: boolean;
    maxViews?: number;
    hasPassword?: boolean;
  };
}

export interface RegenerateTokenResponse {
  success: boolean;
  newToken?: string;
  newUrl?: string;
  message?: any;
}

export interface StatsSummary {
  totalShares: number;
  activeShares: number;
  inactiveShares: number;
  totalViews: number;
  recentViews: number;
}

export interface StatsSummaryResponse {
  success: boolean;
  stats: StatsSummary;
}

export interface MyShareLinks extends ShareLink {
  isActive: boolean;
  createdAt: Date;
  note: {
    id: string;
    title: string;
    updatedAt: Date;
  };
  viewCount: number;
}

export interface AccessSharedNoteDto {
  password?: string;
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

export interface ShareLinkAnalyticsResponse {
  success: boolean;
  analytics?: ShareLinkAnalytics;
  error?: any;
}

export interface ShareLinkResponse {
  success: boolean;
  shareLink?: ShareLink;
  message?: string;
}

export interface MyShareLinksResponse {
  success: boolean;
  shareLinks?: MyShareLinks[];
  count?: number;
  error?: any;
}

export interface CheckShareLinkResponse {
    exists: boolean;
    message: string;
    isValid?: boolean;
    requiresPassword?: boolean;
    requiresAuth?: boolean;
    isPublic?: boolean;
    noteTitle?: string;
    isExpired?: boolean;
}

// export interface ShareAnalytics {
//   totalViews: number;
//   uniqueVisitors: number;
//   viewHistory: Array<{
//     date: string;
//     views: number;
//   }>;
//   geographicData: Array<{
//     country: string;
//     views: number;
//   }>;
//   referrers: Array<{
//     source: string;
//     views: number;
//   }>;
// }

// export interface ShareStats {
//   totalSharedNotes: number;
//   activeLinks: number;
//   totalViews: number;
//   topSharedNotes: Array<{
//     noteId: string;
//     title: string;
//     views: number;
//   }>;
// }
