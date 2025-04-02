'use client';

import { PageTransition } from '@/components/animation/page-transition';
import { AudioPlayer } from '@/components/audio-player';
import { FeedbackForm } from '@/components/feedback-form';
import { MindfulTransition } from '@/components/mindful-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getMeditationByStorageId } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';

export default function PlaybackPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [showFeedback, setShowFeedback] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEndingBreath, setShowEndingBreath] = useState(false);
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
      setIsPlaying(false);

      // Stop the audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Show breathing animation first
      setShowEndingBreath(true);

      // Then show feedback form after animation
      setTimeout(() => {
        setShowEndingBreath(false);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
        setShowFeedback(true);
      }, 3000);
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

  // Track audio play state
  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);

      return () => {
        audioRef.current?.removeEventListener('play', handlePlay);
        audioRef.current?.removeEventListener('pause', handlePause);
      };
    }
  }, [audioRef.current]);

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
      <PageTransition>
        <div className="h-full flex justify-center items-center py-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-meditation-primary/20 border-t-meditation-primary rounded-full animate-spin mb-4"></div>
            <p className="text-meditation-secondary">Indlæser meditation...</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  if (!meditation) {
    return (
      <PageTransition>
        <div className="text-center p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-xl text-meditation-primary mb-4">Meditation not found</h2>
            <Button onClick={() => setLocation('/mindspace')}>Return to Home</Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="h-full space-y-4">
        <motion.div
          className="flex items-center justify-between w-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            className="text-meditation-primary hover:bg-meditation-primary/10 flex items-center gap-2 pl-2"
            onClick={() => setLocation('/')}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Afbryd session</span>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="border-2 border-meditation-primary/10 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 rounded-t-md bg-meditation-primary text-white">
              <CardTitle className="text-2xl text-center flex justify-center items-center gap-2">
                <motion.div
                  animate={{
                    scale: isPlaying ? [1, 1.1, 1] : 1,
                    opacity: isPlaying ? [0.7, 1, 0.7] : 0.7,
                  }}
                  transition={{
                    repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                Afspiller - {meditation.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex-1">
                  <AudioPlayer ref={audioRef} meditation={meditation} onEnded={handleEnded} autoPlay={!hasEndedRef.current} />
                </motion.div>

                <motion.div
                  className="p-5 bg-meditation-primary/5 rounded-lg border border-meditation-primary/10 md:w-1/3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-meditation-primary font-medium mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-meditation-primary/70" />
                    Meditation Tips
                  </h3>
                  <ul className="text-meditation-secondary space-y-3">
                    <motion.li
                      className="flex items-start"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-meditation-primary mt-2 mr-2"></span>
                      Find en behagelig position og luk øjnene
                    </motion.li>
                    <motion.li
                      className="flex items-start"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-meditation-primary mt-2 mr-2"></span>
                      Tag nogle dybe vejrtrækninger før du begynder
                    </motion.li>
                    <motion.li
                      className="flex items-start"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-meditation-primary mt-2 mr-2"></span>
                      Lad tankerne komme og gå uden at dømme dem
                    </motion.li>
                  </ul>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {showEndingBreath && (
          <div className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-white/98 backdrop-blur-sm">
            <motion.div
              className="w-24 h-24 rounded-full bg-meditation-primary/20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                times: [0, 0.5, 1],
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0,
              }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-8 text-meditation-primary text-xl"
            >
              Tag nogle dybe vejrtrækninger...
            </motion.p>
          </div>
        )}

        {/* Feedback form - using a div instead of AnimatedContent to ensure it's rendered */}
        {showFeedback && (
          <FeedbackForm
            storageObjectId={meditation.id}
            onComplete={() => {
              setShowTransition(true);

              // Ensure audio is completely stopped
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }

              setTimeout(() => {
                setShowFeedback(false);
              }, 100);
            }}
          />
        )}

        {/* Transition to welcome page after feedback */}
        {showTransition && (
          <div className="fixed inset-0 z-30 bg-white">
            <MindfulTransition onComplete={() => setLocation('/')} />
          </div>
        )}
      </div>
    </PageTransition>
  );
}
