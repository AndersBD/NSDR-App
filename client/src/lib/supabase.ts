import { createClient } from '@supabase/supabase-js';
import env from './env-config';
import { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

// Types
export type StorageFile = {
  id: string;
  name: string;
  duration: number;
  audioUrl: string;
  imageUrl: string | null;
  createdAt: string;
};

export type DurationFolder = {
  name: string;
  duration: number;
  path: string;
};

export type WellbeingOption = {
  value: number;
  label: string;
  description: string;
};

export type Feedback = {
  id: number;
  storage_object_id: string;
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

// Helper function to get all duration folders
export async function getDurationFolders(): Promise<DurationFolder[]> {
  try {
    const { data: folders, error } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw error;

    return folders
      .filter(folder => folder.name.match(/^\d+\s*minutter$/))
      .map(folder => {
        const duration = parseInt(folder.name.match(/(\d+)/)?.[1] || '0');
        return {
          name: folder.name,
          duration,
          path: folder.name
        };
      })
      .sort((a, b) => a.duration - b.duration);
  } catch (error: any) {
    console.error('Error getting folders:', error);
    throw new Error('Failed to fetch duration folders');
  }
}

// Helper function to get files within a duration folder
export async function getMeditationsByDuration(durationPath: string): Promise<StorageFile[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .list(durationPath, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw error;

    return await Promise.all(
      files
        .filter(file => file.name.endsWith('.mp3') || file.name.endsWith('.wav'))
        .map(async (file) => {
          const basename = file.name.replace(/\.\w+$/, '');

          // Get audio URL
          const { data: audioData } = await supabase.storage
            .from('lydfiler-til-nsdr')
            .getPublicUrl(`${durationPath}/${file.name}`);

          // Check for matching image
          const { data: imageData } = await supabase.storage
            .from('lydfiler-til-nsdr')
            .getPublicUrl(`${durationPath}/${basename}.jpg`);

          const duration = parseInt(durationPath.match(/(\d+)/)?.[1] || '0');

          return {
            id: file.id,
            name: basename,
            duration: duration * 60, // Convert to seconds
            audioUrl: audioData.publicUrl,
            imageUrl: imageData.publicUrl,
            createdAt: file.created_at
          };
        })
    );
  } catch (error: any) {
    console.error('Error getting meditations:', error);
    throw new Error(`Failed to fetch meditations for duration: ${durationPath}`);
  }
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
  storage_object_id: string;
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