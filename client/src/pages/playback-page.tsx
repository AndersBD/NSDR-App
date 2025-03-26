import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { AudioPlayer } from '@/components/audio-player';
import { useEffect, useRef, useState } from 'react';
import { FeedbackForm } from '@/components/feedback-form';
import { MindfulTransition } from '@/components/mindful-transition';
import { getMeditationByStorageId } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function PlaybackPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const { toast } = useToast();

  const { data: meditation, isLoading, error } = useQuery({
    queryKey: ['meditation', id],
    queryFn: () => getMeditationByStorageId(id!),
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setShowFeedback(true);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load meditation session",
      variant: "destructive",
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!meditation) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl text-[#384c44] mb-4">Meditation not found</h2>
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="text-[#384c44] hover:text-[#667c73]"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go back home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Button
          variant="ghost"
          className="mb-4 text-[#384c44] hover:text-[#667c73]"
          onClick={() => setLocation('/')}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Afbryd session
        </Button>

        <Card className="border-2 border-[#384c44]">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-[#384c44]">
              Afspiller...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AudioPlayer meditation={meditation} ref={audioRef} />
          </CardContent>
        </Card>
      </div>

      {showFeedback && meditation && (
        <FeedbackForm
          storageObjectId={meditation.id}
          onComplete={() => {
            setShowFeedback(false);
            setShowTransition(true);
          }}
        />
      )}

      {showTransition && <MindfulTransition onComplete={() => setLocation('/')} />}
    </div>
  );
}