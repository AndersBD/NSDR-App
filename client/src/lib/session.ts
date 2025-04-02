import { supabase } from './supabase';

export async function validateSession(sessionId: string) {
  if (!sessionId) return null;

  try {
    const { data, error } = await supabase.from('sessions').select('*').eq('id', sessionId).single();

    if (error || !data) {
      // Session no longer exists in database
      localStorage.removeItem('sessionId');
      localStorage.removeItem('client_id');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

export function getSessionIdFromStorage() {
  return localStorage.getItem('sessionId');
}

export function saveSessionData(sessionId: string, clientId: string) {
  try {
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('client_id', clientId);

    // For debugging - log saved values
    console.log('Session data saved to localStorage:', {
      sessionId,
      clientId,
    });
  } catch (error) {
    console.error('Failed to save session data to localStorage:', error);
  }
}

export function clearSessionFromStorage() {
  localStorage.removeItem('sessionId');
}

export async function loginClient(inviteCode: string, deviceId: string) {
  if (!deviceId) {
    throw new Error('Device ID is required');
  }

  // Check if the invite code exists
  const { data: client, error } = await supabase.from('clients').select('*').eq('invite_code', inviteCode).single();

  if (error || !client) {
    throw new Error('Invalid invite code');
  }

  // Check if a session already exists for the device - handle more gracefully
  const { data: existingSessions, error: existingSessionError } = await supabase.from('sessions').select('*').eq('device_id', deviceId);

  // Only log actual errors, not just "no rows found"
  if (existingSessionError && existingSessionError.code !== 'PGRST116') {
    console.error('Error checking existing session:', existingSessionError);
  }

  // Check if any sessions were found
  if (existingSessions && existingSessions.length > 0) {
    throw new Error('A session already exists for this device');
  }

  // Create a new session with explicit column definition
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      client_id: client.id,
      device_id: deviceId,
    })
    .select('*')
    .single();

  if (sessionError) {
    throw new Error('Failed to create session: ' + sessionError.message);
  }

  // Save the session ID to local storage
  saveSessionData(session.id, client.id);
  localStorage.setItem('client_id', client.id);

  return session;
}

export async function revokeSession(sessionId: string) {
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
  if (error) {
    throw new Error('Failed to revoke session');
  }
}
