export interface ShareAnalyticsJobData {
  shareLinkId: string;
  userId: string;
}

export interface ShareViewJobData {
  shareLinkId: string;
  viewerInfo: {
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    userId?: string;
  };
}

