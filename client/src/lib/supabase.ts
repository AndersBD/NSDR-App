import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import env from './env-config';

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_KEY
);

// Database types
export type Meditation = {
  id: number;
  title: string;
  duration: number; // in seconds
  file_name: string;
  file_url: string;
  created_at: string;
};

export type Feedback = {
  id: number;
  meditation_id: number;
  wellbeing_change: number;
  created_at: string;
};

// Helper functions for meditations
export async function getMeditations() {
  const { data, error } = await supabase
    .from('meditations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMeditation(id: number) {
  const { data, error } = await supabase.from('meditations').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
}

// Helper functions for feedback
export async function createFeedback(feedback: {
  meditation_id: number;
  wellbeing_change: number;
}) {
  const { data, error } = await supabase
    .from('feedback')
    .insert(feedback)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper functions for auth
export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
}

export async function signUp(email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}