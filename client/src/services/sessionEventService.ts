import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type SessionEvent = Database['public']['Tables']['session_events']['Row'];

export interface SessionStats {
  totalStarted: number;
  totalCompleted: number;
}

export const sessionEventService = {
  startSession: async (storageObjectId: string, clientId?: string | null): Promise<SessionEvent> => {
    const effectiveClientId = clientId || localStorage.getItem('client_id');

    const { data, error } = await supabase
      .from('session_events')
      .insert({
        storage_object_id: storageObjectId,
        client_id: effectiveClientId,
        // is_completed defaults to false in the database
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      throw new Error(`Failed to start session: ${error.message}`);
    }
    if (!data) {
      throw new Error('Failed to start session: No data returned.');
    }
    return data;
  },

  completeSession: async (sessionEventId: number): Promise<SessionEvent> => {
    const { data, error } = await supabase
      .from('session_events')
      .update({
        is_completed: true,
      })
      .eq('id', sessionEventId)
      .select()
      .single();

    if (error) {
      console.error('Error completing session:', error);
      throw new Error(`Failed to complete session: ${error.message}`);
    }
    if (!data) {
      throw new Error('Failed to complete session: No data returned.');
    }
    return data;
  },

  getSessionStats: async (clientId?: string | null): Promise<SessionStats> => {
    let startedQuery = supabase.from('session_events').select('*', { count: 'exact', head: true });
    let completedQuery = supabase.from('session_events').select('*', { count: 'exact', head: true }).eq('is_completed', true);

    if (clientId) {
      startedQuery = startedQuery.eq('client_id', clientId);
      completedQuery = completedQuery.eq('client_id', clientId);
    }

    const [{ count: totalStarted, error: startedError }, { count: totalCompleted, error: completedError }] = await Promise.all([startedQuery, completedQuery]);

    if (startedError) {
      console.error('Error fetching total started sessions:', startedError);
      throw new Error(`Failed to get total started sessions: ${startedError.message}`);
    }
    if (completedError) {
      console.error('Error fetching total completed sessions:', completedError);
      throw new Error(`Failed to get total completed sessions: ${completedError.message}`);
    }

    return {
      totalStarted: totalStarted ?? 0,
      totalCompleted: totalCompleted ?? 0,
    };
  },
};
