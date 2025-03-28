'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createFeedback, getWellbeingOptions } from '@/lib/supabase';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FeedbackFormProps {
  storageObjectId: string;
  onComplete: () => void;
}

export function FeedbackForm({ storageObjectId, onComplete }: FeedbackFormProps) {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch wellbeing options from the database
  const { data: wellbeingOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['wellbeing-options'],
    queryFn: getWellbeingOptions,
  });

  useEffect(() => {
    if (isSubmitting) {
      const safetyTimer = setTimeout(() => {
        onComplete();
      }, 3000); // 3 second safety timeout

      return () => clearTimeout(safetyTimer);
    }
  }, [isSubmitting, onComplete]);

  const feedbackMutation = useMutation({
    mutationFn: async (wellbeingChange: number) => {
      return await createFeedback({
        storage_object_id: storageObjectId,
        wellbeing_change: wellbeingChange,
      });
    },
    onSuccess: () => {
      onComplete();
    },
    onError: (error: Error) => {
      console.error('Feedback submission error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      // Even on error, proceed after a delay
      setTimeout(() => onComplete(), 1500);
    },
  });

  if (isLoadingOptions) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/98 backdrop-blur-md z-[500]">
        <div className="w-16 h-16 border-4 border-meditation-primary/20 border-t-meditation-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/98 backdrop-blur-md z-[500] transition-all duration-300 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}>
        <Card className="w-full max-w-lg border-2 border-meditation-primary/20 shadow-lg">
          <CardHeader className="meditation-header rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              Hvordan har din mentale trivsel ændret sig efter meditationen sammenlignet med før sessionen?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {wellbeingOptions?.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`h-16 text-lg border-2 transition-all duration-200 ${
                    selectedOption === option.value
                      ? 'bg-meditation-primary/90 text-white border-meditation-primary hover:bg-meditation-primary/90'
                      : 'border-meditation-primary/80 text-meditation-primary hover:bg-meditation-primary/60'
                  }`}
                  onClick={() => {
                    setSelectedOption(option.value);
                    setIsSubmitting(true);
                    // Submit feedback immediately after selection
                    feedbackMutation.mutate(option.value);
                  }}
                  disabled={isSubmitting}
                >
                  {option.label}
                  {isSubmitting && selectedOption === option.value && (
                    <span className="ml-2 inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  )}
                </Button>
              ))}
            </div>

            <p className="text-center text-meditation-secondary mt-6 italic">Din feedback hjælper os med at forbedre vores meditationer</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
