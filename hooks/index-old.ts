/**
 * Barrel export for all React Query hooks
 */

// Authentication hooks
export * from './use-auth';

// Notes hooks  
export * from './use-notes';

// AI & Chat hooks
export * from './use-ai';

// Workspace hooks
export * from './use-workspaces';

// Feature hooks
export * from './use-features';

// New comprehensive module hooks
export {
  // Activities
  useGetActivities,
  useGetActivityInsights,
  useGetActivityFeed,
  useGetActivityStats,
  useTrackActivity,
  useCleanupOldActivities,
  useExportActivities,
  useGetActivityHeatmap,
  useGetProductivityMetrics
} from './use-activities';

export {
  // Analytics
  useGetUserAnalytics,
  useGetWorkspaceAnalytics,
  useGetContentAnalytics,
  useTrackNoteAction
} from './use-analytics';

export {
  // Attachments - use different names to avoid conflicts
  useUploadNoteAttachment,
  useGetNoteAttachments,
  useDeleteNoteAttachment,
  useDownloadAttachment,
  useSearchAttachments,
  useGetAttachmentAnalytics,
  useRequestOCR,
  useGetSupportedTypes
} from './use-attachments';

export {
  // Export - use different names to avoid conflicts
  useDownloadExport,
  useCreateNewExport,
  useGetUserExports,
  useDeleteUserExport,
  useGetExportStats,
  useQueueNoteExport
} from './use-export';

export {
  // Notifications
  useNotificationsList,
  useCreateNotificationItem,
  useUpdateNotificationItem,
  useDeleteNotificationItem,
  useGetUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead
} from './use-notifications';

export {
  // Reminders  
  useRemindersList,
  useCreateReminderItem,
  useUpdateReminderItem,
  useDeleteReminderItem,
  useGetDueReminders,
  useGetUpcomingReminders,
  useCompleteReminder,
  useGetReminderStats
} from './use-reminders';

export {
  // Productivity (only core hooks, avoiding conflicts)
  useTaskStats,
  useOverdueTasks,
  useDueReviews,
  useReviewStats,
  usePomodoroStats,
  useActivePomodoroSession
} from './use-productivity';

export {
  // Mobile
  useIsMobile,
  useStartRecording,
  useStopRecording,
  useGetVoiceNotes,
  useTranscribeVoiceNote,
  useCreateLocationNote,
  useGetNearbyNotes,
  useSyncOfflineData,
  useGetSyncStatus
} from './use-mobile';

// Smart Features Hooks - avoid conflicts with existing hooks
export {
  // Categories
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useSuggestCategories,
  useAutoCategorize,
  useNoteCategories,
  useAssignCategory,
  useUnassignCategory,
  // Summaries - prefixed to avoid conflicts
  useNoteSummary as useSmartNoteSummary,
  useGenerateSummary as useSmartGenerateSummary,
  useDeleteSummary,
  useBatchGenerateSummaries,
  useSummaryStats,
  useSummaryTemplates,
  useSummaryVersions,
  // Relations
  useRelatedNotes as useSmartRelatedNotes,
  useStoredRelations,
  useSaveRelation,
  useAnalyzeRelations,
  useNoteGraph,
  useRelationsStats,
  useDeleteRelation,
  // Duplicates
  useDuplicateDetection,
  useDuplicateReports as useSmartDuplicateReports,
  useCreateDuplicateReport,
  useMergeDuplicates,
  useQueueDuplicateDetection,
  useDuplicateStats
} from './use-smart';

// Collaboration Features Hooks - avoid conflicts
export {
  // Collaboration
  useCollaborators,
  useNotePermission,
  useMyCollaborations,
  useCollaborationStats,
  useInviteCollaborator as useCollabInviteCollaborator,
  useRemoveCollaborator as useCollabRemoveCollaborator,
  useUpdatePermission,
  useJoinNote,
  useLeaveCollaboration,
  useUpdateCursor,
  // Share
  useMyShares,
  useShareAnalytics,
  useShareStatsSummary,
  useCreateShareLink as useCollabCreateShareLink,
  useUpdateShareLink,
  useDeleteShareLink,
  useToggleShareStatus,
  useRegenerateShareToken,
  useAccessSharedNote,
  // Versions
  useVersionHistory,
  useVersion,
  useVersionStatistics,
  useRecentVersions,
  useVersionTimeline,
  useCreateVersion,
  useRestoreVersion,
  useDeleteVersion,
  useCompareVersions,
  // Activities
  useActivities,
  useActivityInsights,
  useActivityFeed,
  useActivityStats,
  useActivityHeatmap,
  useProductivityStats as useActivityProductivityStats,
  useTrackActivity,
  useCleanupActivities,
  // Tags - prefixed to avoid conflicts
  useTags as useSmartTags,
  useTagHierarchy,
  useTagAnalytics,
  useTagSuggestions,
  useTagSuggestionHistory,
  useCreateTag as useSmartCreateTag,
  useUpdateTag,
  useDeleteTag,
  useBulkTagOperation
} from './use-collaboration';

// Advanced Features Hooks - avoid conflicts
export {
  // Templates
  useMyTemplates,
  usePublicTemplates,
  useTemplateCategories,
  useTemplateRecommendations,
  useTemplate as useAdvancedTemplate,
  useTemplateStats,
  useSearchTemplates,
  useCreateTemplate as useAdvancedCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useProcessTemplate,
  useDuplicateTemplate,
  useTemplatePreview,
  // Attachments - prefixed to avoid conflicts
  useNoteAttachments as useAdvancedNoteAttachments,
  useAttachmentAnalytics,
  useSupportedAttachmentTypes,
  useSearchAttachments,
  useUploadAttachment as useAdvancedUploadAttachment,
  useDeleteAttachment,
  usePerformOCR,
  // Search
  useSearchHistory,
  usePopularSearches,
  useSavedSearches as useAdvancedSavedSearches,
  useSearchAnalytics,
  useSearchSuggestions,
  useAdvancedSearch as useAdvancedSearchQuery,
  useQuickSearch,
  useSaveSearch,
  useDeleteSavedSearch,
  // Analytics
  useAnalyticsOverview,
  useWorkspaceAnalytics,
  useContentAnalytics,
  useTrackNoteView,
  // Export
  useExports,
  useExportStats,
  useExport,
  useCreateExport as useAdvancedCreateExport,
  useDeleteExport,
  useDownloadExport
} from './use-advanced';

// Productivity & Notifications Hooks - avoid conflicts
export {
  // Notifications - prefixed to avoid conflicts
  useNotifications as useProductivityNotifications,
  useUnreadNotificationCount,
  useNotification,
  useCreateNotification,
  useUpdateNotification,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  // Reminders - prefixed to avoid conflicts  
  useReminders as useProductivityReminders,
  useDueReminders,
  useUpcomingReminders,
  useReminderStats,
  useReminder,
  useCreateReminder as useProductivityCreateReminder,
  useUpdateReminder,
  useCompleteReminder,
  useDeleteReminder,
  // Tasks - prefixed to avoid conflicts
  useTasks as useProductivityTasks,
  useTaskStats,
  useOverdueTasks,
  useDueTasks,
  useTask as useProductivityTask,
  useCreateTask as useProductivityCreateTask,
  useUpdateTask as useProductivityUpdateTask,
  useDeleteTask,
  // Calendar - prefixed to avoid conflicts
  useCalendarEvents as useProductivityCalendarEvents,
  useUpcomingEvents,
  useTodayEvents,
  useWeekEvents,
  useCalendarEvent,
  useCreateCalendarEvent as useProductivityCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  // Pomodoro - prefixed to avoid conflicts
  usePomodoroSessions as useProductivityPomodoroSessions,
  useActivePomodoroSession,
  usePomodoroStats,
  usePomodoroTodayStats,
  useCreatePomodoroSession as useProductivityCreatePomodoroSession,
  useUpdatePomodoroSession as useProductivityUpdatePomodoroSession,
  useDeletePomodoroSession,
  // Review
  useReviews,
  useDueReviews,
  useReviewStats,
  useReview,
  useCreateReview,
  useSetupDefaultReviews,
  useAnswerReview,
  useUpdateReview,
  useDeleteReview
} from './use-productivity';

// Templates and Voice Notes hooks (new features) - currently in use-features.ts
// TODO: Refactor to avoid duplicates
// export { 
//   useTemplateCategories,
//   useVoiceNoteStats,
//   useUploadVoiceNote,
//   useDeleteVoiceNote
// } from './use-templates';

// Tags and Analytics hooks (new comprehensive features) - currently in use-features.ts
// TODO: Refactor to avoid duplicates
// export {
//   useTagHierarchy,
//   useAnalyticsOverview,
//   useWorkspaceAnalytics,
//   useContentAnalytics
// } from './use-tags-analytics';

// Query keys
export { queryKeys, invalidationHelpers } from './query-keys';

// Additional Query Keys exports for advanced usage
export { smartQueryKeys } from './use-smart';
export { collaborationQueryKeys } from './use-collaboration';
export { advancedQueryKeys } from './use-advanced';
export { productivityQueryKeys } from './use-productivity';