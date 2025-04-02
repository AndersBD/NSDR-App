import { supabase } from '@/lib/supabase';

export type Client = {
  id: string;
  client_name: string;
  invite_code: string;
  created_at: string;
};

export type Session = {
  id: string;
  client_id: string;
  device_id: string;
  created_at: string;
};

export const clientService = {
  // Get all clients
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return data || [];
  },

  // Get sessions for a specific client
  getClientSessions: async (clientId: string): Promise<Session[]> => {
    const { data, error } = await supabase.from('sessions').select('*').eq('client_id', clientId).order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return data || [];
  },

  // Revoke a session
  revokeSession: async (sessionId: string): Promise<void> => {
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to revoke session: ${error.message}`);
    }
  },

  // Create a new client
  createClient: async (name: string, inviteCode: string): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ client_name: name, invite_code: inviteCode }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }

    return data;
  },
};
