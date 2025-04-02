import { supabase } from '@/lib/supabase';

export interface SubmitFeedbackParams {
  storageObjectId: string;
  wellbeingChange: number;
  clientId?: string; // Optional: can be provided directly or from context
}

export const feedbackService = {
  submitFeedback: async ({ storageObjectId, wellbeingChange, clientId }: SubmitFeedbackParams) => {
    // If clientId is not provided directly, use the one from localStorage
    // This ensures flexibility - the clientId can come from either the context or localStorage
    const effectiveClientId = clientId || localStorage.getItem('client_id');

    if (!effectiveClientId) {
      console.warn('No client ID found for feedback submission');
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        storage_object_id: storageObjectId,
        wellbeing_change: wellbeingChange,
        client_id: effectiveClientId || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }

    return data;
  },

  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get feedback: ${error.message}`);
    }

    return data;
  },
};
