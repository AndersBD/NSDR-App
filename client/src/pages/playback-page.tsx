import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Meditation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { useEffect, useRef, useState } from "react";

// Added Lottie animation component (replace with your actual Lottie implementation)
const MindfulTransition = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    // Simulate a 2-second delay before redirecting. Replace with your Lottie animation logic.
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      {/* Replace this with your actual Lottie animation */}
      <div>Mindful Transition Animation (Lottie)</div>
    </div>
  );
};


export default function PlaybackPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showTransition, setShowTransition] = useState(false);

  const { data: meditations } = useQuery<Meditation[]>({
    queryKey: ["/api/meditations"],
  });

  const meditation = meditations?.find(m => m.id === parseInt(id!));

  // Handle session completion
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setShowTransition(true);
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [setLocation]);

  if (!meditation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Button
          variant="ghost"
          className="mb-4 text-[#384c44] hover:text-[#667c73]"
          onClick={() => setLocation("/")}
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
      {showTransition && (
        <MindfulTransition onComplete={() => setLocation("/")} />
      )}
    </div>
  );
}