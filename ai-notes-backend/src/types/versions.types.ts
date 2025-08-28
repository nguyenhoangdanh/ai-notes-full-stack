export interface VersionCleanupJobData {
  noteId: string;
  userId: string;
  maxVersions?: number;
  olderThanDays?: number;
}

export interface VersionAnalyticsJobData {
  noteId: string;
  userId: string;
}