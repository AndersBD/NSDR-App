import { getMeditationByStorageId, StorageFile, supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type SessionEvent = Database['public']['Tables']['session_events']['Row'];

export interface SessionStats {
  totalStarted: number;
  totalCompleted: number;
}

export interface DetailedSessionEngagement {
  id: string; // storage_object_id
  name: string;
  imageUrl: string | null;
  duration?: number;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
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

  getDetailedSessionEngagementStats: async (clientId?: string | null): Promise<DetailedSessionEngagement[]> => {
    let query = supabase.from('session_events').select('storage_object_id, is_completed');
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      console.error('Error fetching session events:', eventsError);
      throw new Error(`Failed to fetch session events: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      return [];
    }

    // Process events to get counts per storage_object_id
    const engagementMap: Record<string, { totalStarted: number; totalCompleted: number }> = {};
    for (const event of events) {
      if (!event.storage_object_id) continue;
      if (!engagementMap[event.storage_object_id]) {
        engagementMap[event.storage_object_id] = { totalStarted: 0, totalCompleted: 0 };
      }
      engagementMap[event.storage_object_id].totalStarted += 1;
      if (event.is_completed) {
        engagementMap[event.storage_object_id].totalCompleted += 1;
      }
    }

    const uniqueStorageObjectIds = Object.keys(engagementMap);

    // Fetch meditation details for these unique IDs
    const meditationDetailsPromises = uniqueStorageObjectIds.map((id) => getMeditationByStorageId(id));
    const meditationDetailsResults = await Promise.allSettled(meditationDetailsPromises);

    const meditationsInfo: Record<string, StorageFile | null> = {};
    meditationDetailsResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        meditationsInfo[uniqueStorageObjectIds[index]] = result.value;
      } else {
        console.warn(`Failed to fetch meditation details for ID ${uniqueStorageObjectIds[index]}:`, result.reason);
        meditationsInfo[uniqueStorageObjectIds[index]] = null; // Handle missing meditation info gracefully
      }
    });

    const detailedStats: DetailedSessionEngagement[] = uniqueStorageObjectIds.map((id) => {
      const stats = engagementMap[id];
      const meditationInfo = meditationsInfo[id];
      const totalStarted = stats.totalStarted;
      const totalCompleted = stats.totalCompleted;
      const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

      return {
        id,
        name: meditationInfo?.name || 'Ukendt Meditation',
        imageUrl: meditationInfo?.imageUrl || null,
        duration: meditationInfo?.duration,
        totalStarted,
        totalCompleted,
        completionRate,
      };
    });

    return detailedStats;
  },
};
