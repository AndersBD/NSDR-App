import { Client } from '@/services/clientService';
import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';
import env from './env-config';

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'mindspace-auth-token',
  },
});

// Types
export type StorageFile = {
  id: string;
  name: string;
  duration: number;
  audioUrl: string;
  imageUrl: string | null;
  createdAt: string;
  type?: string;
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

// Get clients
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('client_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Get duration folders for a specific session type
export async function getDurationFoldersByType(sessionType: string): Promise<DurationFolder[]> {
  try {
    const { data: folders, error } = await supabase.storage.from('lydfiler-til-nsdr').list(sessionType, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      console.error(`Error getting duration folders for ${sessionType}:`, error);
      throw error;
    }

    return folders
      .filter((folder) => folder.name.match(/^\d+\s*minutter$/))
      .map((folder) => {
        const duration = parseInt(folder.name.match(/(\d+)/)?.[1] || '0');
        return {
          name: folder.name,
          duration,
          path: folder.name,
        };
      })
      .sort((a, b) => a.duration - b.duration);
  } catch (error: any) {
    console.error('Error getting duration folders:', error);
    throw new Error(`Failed to fetch duration folders for ${sessionType}`);
  }
}

// Get meditations for a specific type and duration
export async function getMeditationsByTypeAndDuration(sessionType: string, durationPath: string): Promise<StorageFile[]> {
  const fullPath = `${sessionType}/${durationPath}`;
  try {
    const { data: files, error } = await supabase.storage.from('lydfiler-til-nsdr').list(fullPath, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      console.error(`Error listing files in ${fullPath}:`, error);
      throw error;
    }

    // First, get all audio files
    const audioFiles = files.filter((file) => file.name.endsWith('.mp3') || file.name.endsWith('.wav'));

    // Create a map of image files for quick lookup
    const imageFiles = new Map(
      files.filter((file) => file.name.endsWith('.jpg') || file.name.endsWith('.png')).map((file) => [file.name.replace(/\.(jpg|png)$/, ''), file])
    );

    return await Promise.all(
      audioFiles.map(async (file) => {
        const basename = file.name.replace(/\.\w+$/, '');

        // Get audio URL
        const { data: audioData } = await supabase.storage.from('lydfiler-til-nsdr').getPublicUrl(`${fullPath}/${file.name}`);

        // Look for matching image file
        const matchingImage = imageFiles.get(basename);
        const imageUrl = matchingImage
          ? (await supabase.storage.from('lydfiler-til-nsdr').getPublicUrl(`${fullPath}/${matchingImage.name}`)).data.publicUrl
          : null;

        const duration = parseInt(durationPath.match(/(\d+)/)?.[1] || '0');

        return {
          id: file.id,
          name: basename,
          duration: duration * 60, // Convert to seconds
          audioUrl: audioData.publicUrl,
          imageUrl: imageUrl,
          createdAt: file.created_at,
          type: sessionType,
        };
      })
    );
  } catch (error: any) {
    console.error('Error getting meditations:', error);
    throw new Error(`Failed to fetch meditations for ${fullPath}`);
  }
}

// Update the getMeditationByStorageId to work with the new structure
export async function getMeditationByStorageId(id: string): Promise<StorageFile | null> {
  try {
    // First check in the "energy" folder
    const energyResult = await searchInTypeFolder('energy', id);
    if (energyResult) return energyResult;

    // Then check in the "relaxation" folder
    const relaxationResult = await searchInTypeFolder('relaxation', id);
    if (relaxationResult) return relaxationResult;

    console.error('File not found with ID:', id);
    return null;
  } catch (error: any) {
    console.error('Error getting meditation:', error);
    throw error;
  }
}

// Helper function to search for a file within a session type folder
async function searchInTypeFolder(sessionType: string, id: string): Promise<StorageFile | null> {
  try {
    // Get all duration folders for this type
    const { data: durationFolders, error: foldersError } = await supabase.storage.from('lydfiler-til-nsdr').list(sessionType);

    if (foldersError) {
      console.error(`Error listing folders in ${sessionType}:`, foldersError);
      return null;
    }

    // Search through each duration folder
    for (const folder of durationFolders) {
      if (!folder.name.match(/^\d+\s*minutter$/)) continue;

      const folderPath = `${sessionType}/${folder.name}`;
      const { data: files, error } = await supabase.storage.from('lydfiler-til-nsdr').list(folderPath);

      if (error) {
        console.error(`Error listing files in ${folderPath}:`, error);
        continue;
      }

      // Find audio file with matching ID
      const audioFile = files.find((f) => f.id === id);
      if (!audioFile) continue;

      const basename = audioFile.name.replace(/\.\w+$/, '');

      // Get audio URL
      const { data: audioData } = await supabase.storage.from('lydfiler-til-nsdr').getPublicUrl(`${folderPath}/${audioFile.name}`);

      // Look for matching image
      const matchingImage = files.find((f) => (f.name.endsWith('.jpg') || f.name.endsWith('.png')) && f.name.startsWith(basename));

      const imageUrl = matchingImage
        ? (await supabase.storage.from('lydfiler-til-nsdr').getPublicUrl(`${folderPath}/${matchingImage.name}`)).data.publicUrl
        : null;

      const duration = parseInt(folder.name.match(/(\d+)/)?.[1] || '0');

      return {
        id: audioFile.id,
        name: basename,
        duration: duration * 60, // Convert to seconds
        audioUrl: audioData.publicUrl,
        imageUrl,
        createdAt: audioFile.created_at,
        type: sessionType,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error searching in ${sessionType} folder:`, error);
    return null;
  }
}

// Helper functions for meditations
export async function getMeditations() {
  const { data, error } = await supabase.from('meditations').select('*').order('created_at', { ascending: false });

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
    const { data: folders, error } = await supabase.storage.from('lydfiler-til-nsdr').list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw error;

    return folders
      .filter((folder) => folder.name.match(/^\d+\s*minutter$/))
      .map((folder) => {
        const duration = parseInt(folder.name.match(/(\d+)/)?.[1] || '0');
        return {
          name: folder.name,
          duration,
          path: folder.name,
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
    const { data: files, error } = await supabase.storage.from('lydfiler-til-nsdr').list(durationPath, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw error;

    // First, get all audio files
    const audioFiles = files.filter((file) => file.name.endsWith('.mp3') || file.name.endsWith('.wav'));

    // Create a map of image files for quick lookup
    const imageFiles = new Map(
      files.filter((file) => file.name.endsWith('.jpg') || file.name.endsWith('.png')).map((file) => [file.name.replace(/\.(jpg|png)$/, ''), file])
    );

    return await Promise.all(
      audioFiles.map(async (file) => {
        const basename = file.name.replace(/\.\w+$/, '');

        // Get audio URL
        const { data: audioData } = await supabase.storage.from('lydfiler-til-nsdr').getPublicUrl(`${durationPath}/${file.name}`);

        // Look for matching image file
        const matchingImage = imageFiles.get(basename);
        const imageUrl = matchingImage
          ? (await supabase.storage.from('lydfiler-til-nsdr').getPublicUrl(`${durationPath}/${matchingImage.name}`)).data.publicUrl
          : null;

        const duration = parseInt(durationPath.match(/(\d+)/)?.[1] || '0');

        return {
          id: file.id,
          name: basename,
          duration: duration * 60, // Convert to seconds
          audioUrl: audioData.publicUrl,
          imageUrl: imageUrl,
          createdAt: file.created_at,
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
  const { data, error } = await supabase.from('wellbeing_options').select('*').order('value', { ascending: true });

  if (error) throw error;
  return data;
}

// Helper functions for feedback
export async function createFeedback(feedback: { storage_object_id: string; wellbeing_change: number }) {
  const { data, error } = await supabase.rpc('insert_feedback', {
    object_id: feedback.storage_object_id,
    wellbeing_val: feedback.wellbeing_change,
  });

  if (error) throw error;
  return data;
}

// Get feedback stats by date range
export async function getFeedbackStats(timeRange?: 'week' | 'month' | 'year' | 'all', clientId?: string) {
  let query = supabase.from('feedback').select(`
    id, 
    wellbeing_change,
    created_at,
    storage_object_id,
    client_id,
    wellbeing_options (
      label
    )
  `);

  // Apply client filtering if specified
  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  // Apply date filtering if timeRange is specified
  if (timeRange && timeRange !== 'all') {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    query = query.gte('created_at', startDate.toISOString());
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Get meditation details for all meditation IDs mentioned in feedback
export async function getMeditationsForFeedback(feedbackData: any[]) {
  // Extract unique meditation IDs
  const meditationIds = Array.from(new Set(feedbackData.map((item) => item.storage_object_id)));

  // Fetch detailed information for each meditation
  const meditations = await Promise.all(
    meditationIds.map(async (id) => {
      try {
        return await getMeditationByStorageId(id);
      } catch (e) {
        console.error(`Error fetching meditation ${id}:`, e);
        return null;
      }
    })
  );

  // Create a lookup map
  return Object.fromEntries(meditations.filter(Boolean).map((meditation) => [meditation!.id, meditation]));
}
