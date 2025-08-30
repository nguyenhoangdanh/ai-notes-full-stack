import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collaborationService, 
  shareService, 
  versionsService, 
  activitiesService, 
  tagsService 
} from '../services/collaboration.service';
import {
  InviteCollaboratorDto,
  UpdatePermissionDto,
  CreateShareLinkDto,
  UpdateShareLinkDto,
  CreateVersionDto,
  TrackActivityDto,
  CollabCreateTagDto as CreateTagDto,
  UpdateTagDto,
  BulkTagOperationDto,
  CursorUpdate
} from '../types';

// Query Keys
export const collaborationQueryKeys = {
  collaboration: {
    all: ['collaboration'] as const,
    collaborators: (noteId: string) => [...collaborationQueryKeys.collaboration.all, 'collaborators', noteId] as const,
    permission: (noteId: string) => [...collaborationQueryKeys.collaboration.all, 'permission', noteId] as const,
    myCollaborations: () => [...collaborationQueryKeys.collaboration.all, 'my-collaborations'] as const,
    stats: () => [...collaborationQueryKeys.collaboration.all, 'stats'] as const,
  },
  share: {
    all: ['share'] as const,
    myShares: () => [...collaborationQueryKeys.share.all, 'my-shares'] as const,
    analytics: (shareLinkId: string) => [...collaborationQueryKeys.share.all, 'analytics', shareLinkId] as const,
    statsSummary: () => [...collaborationQueryKeys.share.all, 'stats-summary'] as const,
  },
  versions: {
    all: ['versions'] as const,
    history: (noteId: string) => [...collaborationQueryKeys.versions.all, 'history', noteId] as const,
    detail: (versionId: string) => [...collaborationQueryKeys.versions.all, 'detail', versionId] as const,
    statistics: (noteId: string) => [...collaborationQueryKeys.versions.all, 'statistics', noteId] as const,
    recent: () => [...collaborationQueryKeys.versions.all, 'recent'] as const,
    timeline: (noteId: string) => [...collaborationQueryKeys.versions.all, 'timeline', noteId] as const,
  },
  activities: {
    all: ['activities'] as const,
    list: (limit?: number, cursor?: string) => [...collaborationQueryKeys.activities.all, 'list', { limit, cursor }] as const,
    insights: () => [...collaborationQueryKeys.activities.all, 'insights'] as const,
    feed: (limit?: number, cursor?: string) => [...collaborationQueryKeys.activities.all, 'feed', { limit, cursor }] as const,
    stats: () => [...collaborationQueryKeys.activities.all, 'stats'] as const,
    heatmap: (year?: number) => [...collaborationQueryKeys.activities.all, 'heatmap', { year }] as const,
    productivity: () => [...collaborationQueryKeys.activities.all, 'productivity'] as const,
  },
  tags: {
    all: ['tags'] as const,
    list: () => [...collaborationQueryKeys.tags.all, 'list'] as const,
    hierarchy: () => [...collaborationQueryKeys.tags.all, 'hierarchy'] as const,
    analytics: () => [...collaborationQueryKeys.tags.all, 'analytics'] as const,
    suggestions: (noteId: string) => [...collaborationQueryKeys.tags.all, 'suggestions', noteId] as const,
    suggestionHistory: () => [...collaborationQueryKeys.tags.all, 'suggestion-history'] as const,
  },
};

// Collaboration Hooks
export const useCollaborators = (noteId: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.collaboration.collaborators(noteId),
    queryFn: () => collaborationService.getCollaborators(noteId),
    enabled: !!noteId,
  });
};

export const useNotePermission = (noteId: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.collaboration.permission(noteId),
    queryFn: () => collaborationService.getPermission(noteId),
    enabled: !!noteId,
  });
};

export const useMyCollaborations = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.collaboration.myCollaborations(),
    queryFn: () => collaborationService.getMyCollaborations(),
  });
};

export const useCollaborationStats = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.collaboration.stats(),
    queryFn: () => collaborationService.getStats(),
  });
};

export const useInviteCollaborator = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: InviteCollaboratorDto }) =>
      collaborationService.inviteCollaborator(noteId, data),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.collaboration.collaborators(noteId) });
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.collaboration.stats() });
    },
  });
};

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, userId }: { noteId: string; userId: string }) =>
      collaborationService.removeCollaborator(noteId, userId),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.collaboration.collaborators(noteId) });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, userId, data }: { noteId: string; userId: string; data: UpdatePermissionDto }) =>
      collaborationService.updatePermission(noteId, userId, data),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.collaboration.collaborators(noteId) });
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.collaboration.permission(noteId) });
    },
  });
};

export const useJoinNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: { socketId: string } }) => collaborationService.joinNote(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.collaboration.myCollaborations() });
    },
  });
};

export const useLeaveCollaboration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { socketId: string }) => collaborationService.leaveNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.collaboration.myCollaborations() });
    },
  });
};

export const useUpdateCursor = () => {
  return useMutation({
    mutationFn: (data: CursorUpdate) => collaborationService.updateCursor(data),
  });
};

// Share Hooks
export const useMyShares = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.share.myShares(),
    queryFn: () => shareService.getMyShares(),
  });
};

export const useShareAnalytics = (shareLinkId: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.share.analytics(shareLinkId),
    queryFn: () => shareService.getAnalytics(shareLinkId),
    enabled: !!shareLinkId,
  });
};

export const useShareStatsSummary = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.share.statsSummary(),
    queryFn: () => shareService.getStatsSummary(),
  });
};

export const useCreateShareLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data?: CreateShareLinkDto }) =>
      shareService.createShareLink(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.share.myShares() });
    },
  });
};

export const useUpdateShareLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shareLinkId, data }: { shareLinkId: string; data: UpdateShareLinkDto }) =>
      shareService.updateShareLink(shareLinkId, data),
    onSuccess: (_, { shareLinkId }) => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.share.myShares() });
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.share.analytics(shareLinkId) });
    },
  });
};

export const useDeleteShareLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (shareLinkId: string) => shareService.deleteShareLink(shareLinkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.share.myShares() });
    },
  });
};

export const useToggleShareStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (shareLinkId: string) => shareService.toggleStatus(shareLinkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.share.myShares() });
    },
  });
};

export const useRegenerateShareToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (shareLinkId: string) => shareService.regenerateToken(shareLinkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.share.myShares() });
    },
  });
};

export const useAccessSharedNote = (token: string) => {
  return useQuery({
    queryKey: ['shared-note', token],
    queryFn: () => shareService.accessSharedNote(token),
    enabled: !!token,
  });
};

// Versions Hooks
export const useVersionHistory = (noteId: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.versions.history(noteId),
    queryFn: () => versionsService.getHistory(noteId),
    enabled: !!noteId,
  });
};

export const useVersion = (versionId: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.versions.detail(versionId),
    queryFn: () => versionsService.getVersion(versionId),
    enabled: !!versionId,
  });
};

export const useVersionStatistics = (noteId: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.versions.statistics(noteId),
    queryFn: () => versionsService.getStatistics(noteId),
    enabled: !!noteId,
  });
};

export const useRecentVersions = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.versions.recent(),
    queryFn: () => versionsService.getRecent(),
  });
};

export const useVersionTimeline = (noteId: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.versions.timeline(noteId),
    queryFn: () => versionsService.getTimeline(noteId),
    enabled: !!noteId,
  });
};

export const useCreateVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data?: CreateVersionDto }) =>
      versionsService.createVersion(noteId, data),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.versions.history(noteId) });
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.versions.statistics(noteId) });
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.versions.recent() });
    },
  });
};

export const useRestoreVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (versionId: string) => versionsService.restoreVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] }); // Invalidate notes since content changed
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.versions.all });
    },
  });
};

export const useDeleteVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (versionId: string) => versionsService.deleteVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.versions.all });
    },
  });
};

export const useCompareVersions = () => {
  return useMutation({
    mutationFn: ({ noteId, fromVersion, toVersion }: { 
      noteId: string; 
      fromVersion: string; 
      toVersion: string 
    }) => versionsService.compareVersions(noteId, fromVersion, toVersion),
  });
};

// Activities Hooks
export const useActivities = (limit?: number, cursor?: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.activities.list(limit, cursor),
    queryFn: () => activitiesService.getActivities(limit, cursor),
  });
};

export const useActivityInsights = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.activities.insights(),
    queryFn: () => activitiesService.getInsights(),
  });
};

export const useActivityFeed = (limit?: number, cursor?: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.activities.feed(limit, cursor),
    queryFn: () => activitiesService.getFeed(limit, cursor),
  });
};

export const useActivityStats = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.activities.stats(),
    queryFn: () => activitiesService.getStats(),
  });
};

export const useActivityHeatmap = (year?: number) => {
  return useQuery({
    queryKey: collaborationQueryKeys.activities.heatmap(year),
    queryFn: () => activitiesService.getHeatmap(year),
  });
};

export const useProductivityStats = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.activities.productivity(),
    queryFn: () => activitiesService.getProductivityStats(),
  });
};

export const useTrackActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TrackActivityDto) => activitiesService.trackActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.activities.all });
    },
  });
};

export const useCleanupActivities = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (daysToKeep?: number) => activitiesService.cleanup(daysToKeep),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.activities.all });
    },
  });
};

// Tags Hooks
export const useTags = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.tags.list(),
    queryFn: () => tagsService.getAll(),
  });
};

export const useTagHierarchy = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.tags.hierarchy(),
    queryFn: () => tagsService.getHierarchy(),
  });
};

export const useTagAnalytics = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.tags.analytics(),
    queryFn: () => tagsService.getAnalytics(),
  });
};

export const useTagSuggestions = (noteId: string) => {
  return useQuery({
    queryKey: collaborationQueryKeys.tags.suggestions(noteId),
    queryFn: () => tagsService.getSuggestions(noteId),
    enabled: !!noteId,
  });
};

export const useTagSuggestionHistory = () => {
  return useQuery({
    queryKey: collaborationQueryKeys.tags.suggestionHistory(),
    queryFn: () => tagsService.getSuggestionHistory(),
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTagDto) => tagsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.tags.all });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagDto }) =>
      tagsService.update(tagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.tags.all });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tagId: string) => tagsService.delete(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.tags.all });
    },
  });
};

export const useBulkTagOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkTagOperationDto) => tagsService.bulkOperation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.tags.all });
    },
  });
};