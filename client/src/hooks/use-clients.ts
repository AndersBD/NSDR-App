import { clientService, Session } from '@/services/clientService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getClients,
  });
}

export function useClientSessions(clientId: string | null) {
  return useQuery({
    queryKey: ['client-sessions', clientId],
    queryFn: () => (clientId ? clientService.getClientSessions(clientId) : Promise.resolve([])),
    enabled: !!clientId, // Only run the query if we have a clientId
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => clientService.revokeSession(sessionId),
    onSuccess: (_, sessionId) => {
      // Invalidate all client-sessions queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['client-sessions'] });

      // Optimistically update the UI by removing the session from the cache
      queryClient.setQueriesData({ queryKey: ['client-sessions'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((session: Session) => session.id !== sessionId);
      });
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, inviteCode }: { name: string; inviteCode: string }) => clientService.createClient(name, inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
