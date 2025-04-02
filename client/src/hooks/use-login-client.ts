import { useToast } from '@/hooks/use-toast';
import { loginClient } from '@/lib/session';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export function useLoginClient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ inviteCode, deviceId }: { inviteCode: string; deviceId: string }) => {
      try {
        // Try standard login
        return await loginClient(inviteCode, deviceId);
      } catch (error: any) {
        // If it's a "session already exists" error and we have the ID stored, use that
        if (error.message && error.message.includes('session already exists')) {
          const storedClientId = localStorage.getItem('client_id');
          const storedSessionId = localStorage.getItem('sessionId');

          if (storedClientId && storedSessionId) {
            console.log('Reusing existing session:', {
              sessionId: storedSessionId,
              clientId: storedClientId,
            });

            return {
              id: storedSessionId,
              client_id: storedClientId,
              device_id: deviceId,
            };
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);

      // Store session data
      localStorage.setItem('client_id', data.client_id);
      localStorage.setItem('sessionId', data.id);

      // Redirect to welcome page
      toast({
        title: 'Login successful',
        description: 'Redirecting to welcome page...',
      });

      setLocation('/');
    },
    onError: (error: any) => {
      console.error('Login failed:', error.message);
      toast({
        title: 'Login failed',
        description: error.message || 'Failed to login',
        variant: 'destructive',
      });
    },
  });
}
