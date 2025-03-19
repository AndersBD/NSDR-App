import { useState, useRef, useEffect, forwardRef } from "react";
import { Meditation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, StopCircle } from "lucide-react";

interface AudioPlayerProps {
  meditation: Meditation;
}

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  function AudioPlayer({ meditation }, ref) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Sync the forwarded ref with our local ref
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(audioRef.current);
      } else {
        ref.current = audioRef.current;
      }
    }, [ref]);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        audio.currentTime = 0;
      };

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("ended", handleEnded);

      // Auto-play when component mounts
      audio.play().catch(() => {
        // Handle auto-play blocking
        setIsPlaying(false);
      });
      setIsPlaying(true);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("ended", handleEnded);
      };
    }, []);

    const togglePlay = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleSeek = (value: number[]) => {
      if (audioRef.current) {
        audioRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
      }
    };

    const stopPlayback = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
      }
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className="space-y-8">
        <audio ref={audioRef} src={meditation.fileUrl} preload="metadata" />

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{meditation.title}</h3>
          <span className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(meditation.duration)}
          </span>
        </div>

        <Slider
          value={[currentTime]}
          max={meditation.duration}
          step={1}
          onValueChange={handleSeek}
          className="my-4"
        />

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={stopPlayback}
          >
            <StopCircle className="h-6 w-6" />
          </Button>

          <Button size="lg" onClick={togglePlay}>
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";