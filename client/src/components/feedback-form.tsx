'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubmitFeedback } from '@/hooks/use-feedback';
import { useToast } from '@/hooks/use-toast';
import { useClientSession } from '@/lib/client-context';
import { getWellbeingOptions } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
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
  const { clientId } = useClientSession();
  const { mutate: submitFeedback } = useSubmitFeedback();

  // Fetch wellbeing options from the database
  const { data: wellbeingOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['wellbeing-options'],
    queryFn: getWellbeingOptions,
  });

  // Auto-timeout for the feedback form
  useEffect(() => {
    // Auto-timeout after 30 seconds of inactivity
    const autoTimeoutDuration = 180000;
    const autoTimeout = setTimeout(() => {
      // Only auto-complete if user hasn't started submitting
      if (!isSubmitting && !selectedOption) {
        onComplete();
      }
    }, autoTimeoutDuration);

    // Clean up timeout if component unmounts or user interacts
    return () => clearTimeout(autoTimeout);
  }, [onComplete, isSubmitting, selectedOption]);

  useEffect(() => {
    if (isSubmitting) {
      const safetyTimer = setTimeout(() => {
        onComplete();
      }, 3000); // 3 second safety timeout

      return () => clearTimeout(safetyTimer);
    }
  }, [isSubmitting, onComplete]);

  const handleSubmitFeedback = (wellbeingChange: number) => {
    setSelectedOption(wellbeingChange);
    setIsSubmitting(true);

    submitFeedback(
      {
        storageObjectId,
        wellbeingChange,
        clientId: clientId ?? undefined, // Convert null to undefined
      },
      {
        onSuccess: () => {
          onComplete();
        },
        onError: (error: any) => {
          console.error('Feedback submission error:', error);
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
          // Even on error, proceed after a delay
          setTimeout(() => onComplete(), 1500);
        },
      }
    );
  };

  if (isLoadingOptions) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/98 backdrop-blur-md z-[500]">
        <div className="w-16 h-16 border-4 border-meditation-primary/20 border-t-meditation-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const reversedOptions = wellbeingOptions ? [...wellbeingOptions].reverse() : [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/98 backdrop-blur-md z-[500] transition-all duration-300 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}>
        <Card className="w-full max-w-lg border-2 border-meditation-primary/20 shadow-lg">
          <CardHeader className="meditation-header rounded-t-lg">
            <CardTitle className="text-2xl text-center">I hvor høj grad føler du dig mere afslappet eller genopladet efter denne MindSpace-session?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {reversedOptions?.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`h-16 text-lg border-2 transition-all duration-200 ${
                    selectedOption === option.value
                      ? 'bg-meditation-primary/90 text-white border-meditation-primary hover:bg-meditation-primary/90'
                      : 'border-meditation-primary/80 text-meditation-primary hover:bg-meditation-primary/60'
                  }`}
                  onClick={() => handleSubmitFeedback(option.value)}
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
