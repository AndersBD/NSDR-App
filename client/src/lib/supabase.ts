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

// Database types
export type Meditation = {
  id: number;
  title: string;
  duration: number; // in seconds
  file_name: string;
  file_url: string;
  storage_object_id: string | null;
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

// Helper function to get wellbeing options
export async function getWellbeingOptions() {
  const { data, error } = await supabase.from('wellbeing_options').select('*').order('value');

  if (error) throw error;
  return data;
}

// Helper functions for feedback
export async function createFeedback(feedback: {
  storage_object_id: string;
  wellbeing_change: number;
}) {
  const { data, error } = await supabase.from('feedback').insert(feedback).select().single();

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
    const { data: audioFiles, error: audioError } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .list(`${durationPath}/audio`, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (audioError) throw audioError;

    const files = await Promise.all(
      audioFiles
        .filter(file => file.name.endsWith('.mp3') || file.name.endsWith('.wav'))
        .map(async (file) => {
          const basename = file.name.replace(/\.\w+$/, '');

          // Get audio URL
          const { data: audioData } = await supabase.storage
            .from('lydfiler-til-nsdr')
            .getPublicUrl(`${durationPath}/audio/${file.name}`);

          // Check for matching image
          const { data: imageData } = await supabase.storage
            .from('lydfiler-til-nsdr')
            .getPublicUrl(`${durationPath}/images/${basename}.jpg`);

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

    return files;
  } catch (error: any) {
    console.error('Error getting meditations:', error);
    throw new Error(`Failed to fetch meditations for duration: ${durationPath}`);
  }
}

// Helper function for file uploads
export async function uploadMeditationFiles(
  audioFile: File,
  imageFile: File | null,
  folder: string
) {
  try {
    console.log('Uploading files to folder:', folder);

    // Upload audio file
    const audioPath = `${folder}/audio/${audioFile.name}`;
    const { data: audioData, error: audioError } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .upload(audioPath, audioFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (audioError) {
      console.error('Audio upload error:', audioError);
      if (audioError.message.includes('row-level security policy')) {
        throw new Error('Storage permissions not configured. Please check Supabase storage bucket policies.');
      }
      throw audioError;
    }

    // Upload image file if provided
    let imagePath = null;
    if (imageFile) {
      const basename = audioFile.name.replace(/\.\w+$/, '');
      imagePath = `${folder}/images/${basename}.jpg`;
      const { error: imageError } = await supabase.storage
        .from('lydfiler-til-nsdr')
        .upload(imagePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (imageError) {
        console.error('Image upload error:', imageError);
        // Cleanup audio file if image upload fails
        await supabase.storage.from('lydfiler-til-nsdr').remove([audioPath]);
        throw imageError;
      }
    }

    // Get public URLs
    const { data: audioUrlData } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .getPublicUrl(audioPath);

    const { data: imageUrlData } = imagePath
      ? await supabase.storage.from('lydfiler-til-nsdr').getPublicUrl(imagePath)
      : { data: { publicUrl: null } };

    return {
      audioPath,
      audioUrl: audioUrlData.publicUrl,
      imagePath,
      imageUrl: imageUrlData.publicUrl
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
}

// Helper functions for file uploads (Original uploadFile function remains, might be redundant now)
export async function uploadFile(file: File, folder: string) {
  try {
    console.log('Attempting upload to folder:', folder); // Debug log

    const { data, error } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .upload(`${folder}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      if (error.message.includes('row-level security policy')) {
        throw new Error(
          'Storage permissions not configured. Please check Supabase storage bucket policies.'
        );
      }
      if (error.message.includes('duplicate')) {
        throw new Error(
          'A file with this name already exists. Please rename the file or use a different one.'
        );
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
      url: urlData.publicUrl,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
}