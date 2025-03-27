'use client';

import { AudioPlayer } from '@/components/audio-player';
import { FeedbackForm } from '@/components/feedback-form';
import { MindfulTransition } from '@/components/mindful-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getMeditationByStorageId } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';

export default function PlaybackPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [showFeedback, setShowFeedback] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  // Flag to prevent multiple triggers
  const hasEndedRef = useRef(false);

  const {
    data: meditation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['meditation', id],
    queryFn: () => getMeditationByStorageId(id!),
    retry: 1,
  });

  // Handle ending of audio playback
  const handleEnded = () => {
    // Only run this once
    if (!hasEndedRef.current) {
      hasEndedRef.current = true;

      // Stop the audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Show feedback form after a delay
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
        setShowFeedback(true);
      }, 2000);
    }
  };

  // Check to ensure audio doesn't play when feedback is showing
  useEffect(() => {
    if (showFeedback && audioRef.current) {
      const stopAudio = () => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      };

      stopAudio();

      // Extra safety - check again after a short delay
      const safetyCheck = setTimeout(stopAudio, 100);
      return () => clearTimeout(safetyCheck);
    }
  }, [showFeedback]);

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load meditation session',
      variant: 'destructive',
    });
    console.error('Meditation load error:', error);
  }

  if (isLoading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-meditation-primary/20 border-t-meditation-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!meditation) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-meditation-primary mb-4">Meditation not found</h2>
        <Button onClick={() => setLocation('/')}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" className="text-meditation-primary hover:bg-meditation-primary/20" onClick={() => setLocation('/')}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Afbryd session
        </Button>

        <div className="flex items-center mr-2">
          <Volume2 className="w-4 h-4 text-meditation-secondary mr-2" />
          <span className="text-sm text-meditation-secondary">Brug gerne høretelefoner</span>
        </div>
      </div>

      <Card className="meditation-card overflow-hidden mt-4">
        <CardHeader className="meditation-header pb-4 rounded-t-md">
          <CardTitle className="text-2xl text-center">Afspiller - {meditation.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <AudioPlayer ref={audioRef} meditation={meditation!} onEnded={handleEnded} autoPlay={!hasEndedRef.current} />
          <div className="mt-6 p-4 bg-meditation-primary/5 rounded-lg">
            <h3 className="text-meditation-primary font-medium mb-2">Meditation Tips</h3>
            <ul className="text-meditation-secondary space-y-2">
              <li className="flex items-start">
                <span className="inline-block h-2 w-2 rounded-full bg-meditation-primary mt-2 mr-2"></span>
                Find en behagelig position og luk øjnene
              </li>
              <li className="flex items-start">
                <span className="inline-block h-2 w-2 rounded-full bg-meditation-primary mt-2 mr-2"></span>
                Tag nogle dybe vejrtrækninger før du begynder
              </li>
              <li className="flex items-start">
                <span className="inline-block h-2 w-2 rounded-full bg-meditation-primary mt-2 mr-2"></span>
                Lad tankerne komme og gå uden at dømme dem
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {showFeedback && (
        <FeedbackForm
          storageObjectId={meditation!.id}
          onComplete={() => {
            setShowFeedback(false);

            // Ensure audio is completely stopped
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }

            setShowTransition(true);
          }}
        />
      )}

      {showTransition && <MindfulTransition onComplete={() => setLocation('/')} />}
    </div>
  );
}
