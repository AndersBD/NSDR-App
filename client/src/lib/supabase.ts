import { createClient } from '@supabase/supabase-js';
import env from './env-config';
import { Database } from '@/types/supabase'; //Retained from original

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false // Since we're using our own auth system
    }
  }
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

export type WellbeingOption = {
  value: number;
  label: string;
  description: string;
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
  const { data, error } = await supabase
    .from('meditations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Helper function to get wellbeing options
export async function getWellbeingOptions() {
  const { data, error } = await supabase
    .from('wellbeing_options')
    .select('*')
    .order('value');

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

// Helper function for file uploads
export async function uploadFile(file: File, folder: string) {
  try {
    console.log('Attempting upload to folder:', folder); // Debug log

    const { data, error } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .upload(`${folder}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      if (error.message.includes('row-level security policy')) {
        throw new Error('Storage permissions not configured. Please check Supabase storage bucket policies.');
      }
      if (error.message.includes('duplicate')) {
        throw new Error('A file with this name already exists. Please rename the file or use a different one.');
      }
      if (error.message.includes('permission')) {
        throw new Error('Storage permission denied. Please check bucket permissions in Supabase.');
      }
      throw error;
    }

    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .getPublicUrl(`${folder}/${file.name}`);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for the uploaded file');
    }

    return {
      path: `${folder}/${file.name}`,
      url: urlData.publicUrl
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
}