'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createFeedback, getWellbeingOptions } from '@/lib/supabase';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface FeedbackFormProps {
  storageObjectId: string;
  onComplete: () => void;
}

export function FeedbackForm({ storageObjectId, onComplete }: FeedbackFormProps) {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Fetch wellbeing options from the database
  const { data: wellbeingOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['wellbeing-options'],
    queryFn: getWellbeingOptions,
  });

  const feedbackMutation = useMutation({
    mutationFn: async (wellbeingChange: number) => {
      return await createFeedback({
        storage_object_id: storageObjectId,
        wellbeing_change: wellbeingChange,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Tak for din feedback',
        description: 'Din feedback er blevet registreret.',
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
    <div className="fixed inset-0 flex items-center justify-center bg-white/98 backdrop-blur-md z-[500] transition-all duration-300 animate-fadeIn p-4">
      <Card className="w-full max-w-lg border-2 border-meditation-primary/20 shadow-lg">
        <CardHeader className="meditation-header rounded-t-lg">
          <CardTitle className="text-2xl text-center ">Hvordan har din mentale trivsel ændret sig efter meditationen sammenlignet med før sessionen?</CardTitle>
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
                    : 'border-meditation-primary/80 text-meditation-primary hover:bg-meditation-primary/80'
                }`}
                onClick={() => {
                  setSelectedOption(option.value);
                  // Submit feedback immediately after selection
                  feedbackMutation.mutate(option.value);
                }}
                disabled={feedbackMutation.isPending}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <p className="text-center text-meditation-secondary mt-6 italic">Din feedback hjælper os med at forbedre vores meditationer</p>
        </CardContent>
      </Card>
    </div>
  );
}
