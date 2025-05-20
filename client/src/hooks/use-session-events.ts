import { DetailedSessionEngagement, SessionEvent, sessionEventService, SessionStats } from '@/services/sessionEventService';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useStartSession() {
  return useMutation<SessionEvent, Error, { storageObjectId: string; clientId?: string | null }>({
    mutationFn: ({ storageObjectId, clientId }) => sessionEventService.startSession(storageObjectId, clientId),
  });
}

export function useCompleteSession() {
  return useMutation<SessionEvent, Error, number>({
    mutationFn: (sessionEventId: number) => sessionEventService.completeSession(sessionEventId),
  });
}

export function useSessionStats(clientId?: string | null) {
  return useQuery<SessionStats, Error>({
    queryKey: ['sessionStats', clientId || 'all'],
    queryFn: () => sessionEventService.getSessionStats(clientId),
  });
}

export function useDetailedSessionEngagementStats(clientId?: string | null) {
  return useQuery<DetailedSessionEngagement[], Error>({
    queryKey: ['detailedSessionEngagementStats', clientId || 'all'],
    queryFn: () => sessionEventService.getDetailedSessionEngagementStats(clientId),
  });
}
