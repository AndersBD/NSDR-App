import { SessionEvent, sessionEventService, SessionStats } from '@/services/sessionEventService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from './use-toast';

export function useStartSession() {
  const { toast } = useToast();
  return useMutation<SessionEvent, Error, { storageObjectId: string; clientId?: string | null }>({
    mutationFn: ({ storageObjectId, clientId }) => sessionEventService.startSession(storageObjectId, clientId),
    onSuccess: (data) => {
      console.log('Session event created (started):', data);
      // Session started, created_at is the start time. is_completed is false.
    },
    onError: (error) => {
      console.error('Failed to create session event:', error.message);
      toast({
        title: 'Error',
        description: `Could not record session start: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

export function useCompleteSession() {
  const { toast } = useToast();
  return useMutation<SessionEvent, Error, number>({
    mutationFn: (sessionEventId: number) => sessionEventService.completeSession(sessionEventId),
    onSuccess: (data) => {
      console.log('Session event marked as completed:', data);
    },
    onError: (error) => {
      console.error('Failed to mark session as completed:', error.message);
      toast({
        title: 'Error',
        description: `Could not record session completion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

export function useSessionStats(clientId?: string | null) {
  return useQuery<SessionStats, Error>({
    queryKey: ['sessionStats', clientId || 'all'],
    queryFn: () => sessionEventService.getSessionStats(clientId),
  });
}
