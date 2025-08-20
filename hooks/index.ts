/**
 * Barrel export for all React Query hooks
 */

// Core hooks - avoid conflicts
export * from './use-auth';
export * from './use-notes';
export * from './use-ai';
export * from './use-workspaces';

// Smart Features
export {
  useCategories,
  useCategory,
  useCategoryNotes,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useSuggestCategories,
  useAutoCategorize,
  useNoteCategories,
  useAssignCategory,
  useUnassignCategory,
  useNoteSummary,
  useSummaryStats,
  useSummaryTemplates,
  useSummaryVersions,
  useGenerateSummary,
  useBatchGenerateSummaries,
  useDeleteSummary,
  useRelatedNotes,
  useStoredRelations,
  useNoteGraph,
  useRelationsStats,
  useSaveRelation,
  useAnalyzeRelations,
  useDeleteRelation,
  useDuplicateDetection,
  useDuplicateReports,
  useDuplicateStats,
  useCreateDuplicateReport,
  useMergeDuplicates,
  useQueueDuplicateDetection
} from './use-smart';

// // New module hooks using the actual exported names
// export {
//   // Activities
//   useGetActivities,
//   useGetActivityInsights,
//   useGetActivityFeed,
//   useGetActivityStats,
//   useTrackActivity as useTrackUserActivity,
//   useCleanupOldActivities,
//   useExportActivities,
//   useGetActivityHeatmap,
//   useGetProductivityMetrics
// } from './use-activities';

// export {
//   // Analytics
//   useGetUserAnalytics,
//   useGetWorkspaceAnalytics,
//   useGetContentAnalytics,
//   useTrackNoteAction
// } from './use-analytics';

// export {
//   // Attachments
//   useUploadNoteAttachment,
//   useGetNoteAttachments,
//   useDeleteNoteAttachment,
//   useDownloadAttachment,
//   useSearchAttachments,
//   useGetAttachmentAnalytics,
//   useRequestOCR,
//   useGetSupportedTypes
// } from './use-attachments';

// export {
//   // Export - use actual export names
//   useDownload as useDownloadExport,
//   useCreateExport as useCreateNewExport,
//   useGetUserExports,
//   useDeleteExport as useDeleteUserExport,
//   useGetExportStats,
//   useQueueNoteExport
// } from './use-export';

// export {
//   // Notifications - use actual export names
//   useGetNotifications as useNotificationsList,
//   useCreateNotification as useCreateNotificationItem,
//   useUpdateNotification as useUpdateNotificationItem,
//   useDeleteNotification as useDeleteNotificationItem,
//   useGetUnreadCount as useGetUnreadNotificationCount,
//   useMarkAsRead as useMarkNotificationAsRead,
//   useMarkAllAsRead as useMarkAllNotificationsAsRead
// } from './use-notifications';

// export {
//   // Reminders - use actual export names
//   useGetReminders as useRemindersList,
//   useCreateReminder as useCreateReminderItem,
//   useUpdateReminder as useUpdateReminderItem,
//   useDeleteReminder as useDeleteReminderItem,
//   useGetDueReminders,
//   useGetUpcomingReminders,
//   useCompleteReminder,
//   useGetReminderStats
// } from './use-reminders';

// export {
//   // Productivity - only non-conflicting hooks
//   useTaskStats,
//   useOverdueTasks,
//   useDueReviews,
//   useReviewStats,
//   usePomodoroStats,
//   useActivePomodoroSession
// } from './use-productivity';

// export {
//   // Mobile
//   useIsMobile,
//   useStartRecording,
//   useStopRecording,
//   useGetVoiceNotes,
//   useTranscribeVoiceNote,
//   useCreateLocationNote,
//   useGetNearbyNotes,
//   useSyncOfflineData,
//   useGetSyncStatus
// } from './use-mobile';