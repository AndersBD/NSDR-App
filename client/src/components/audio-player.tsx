'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { StorageFile } from '@/lib/supabase';
import { Pause, Play, StopCircle, Volume2, VolumeX } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  meditation: StorageFile;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(function AudioPlayer({ meditation, onEnded, autoPlay = false }, ref) {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Refs
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const endTriggeredRef = useRef(false);

  // Sync the forwarded ref with our local ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(localAudioRef.current);
    } else {
      ref.current = localAudioRef.current;
    }
  }, [ref]);

  // Main effect for audio event listeners and autoplay
  useEffect(() => {
    const audio = localAudioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Fallback end detection (if 'ended' event fails)
      if (!audio.paused && audio.duration > 0 && audio.currentTime > 0) {
        if (audio.currentTime >= audio.duration - 0.1 && !endTriggeredRef.current) {
          endTriggeredRef.current = true;
          setCurrentTime(audio.duration);
          audio.pause();
          if (onEnded) {
            onEnded();
          }
        }
      }
    };

    const syncPlayState = () => {
      setIsPlaying(!audio.paused);
    };

    const handleActualEndedEvent = () => {
      if (!endTriggeredRef.current) {
        endTriggeredRef.current = true;
        setIsPlaying(false);
        if (audio.duration) {
          setCurrentTime(audio.duration);
        }
        if (onEnded) {
          onEnded();
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', syncPlayState);
    audio.addEventListener('pause', syncPlayState);
    audio.addEventListener('ended', handleActualEndedEvent);

    audio.volume = isMuted ? 0 : volume;

    if (autoPlay && !audio.played.length && !endTriggeredRef.current) {
      audio.play().catch((err) => {
        console.log('Autoplay prevented by browser:', err);
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', syncPlayState);
      audio.removeEventListener('pause', syncPlayState);
      audio.removeEventListener('ended', handleActualEndedEvent);
    };
  }, [autoPlay, volume, isMuted, onEnded]);

  useEffect(() => {
    if (localAudioRef.current) {
      localAudioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = localAudioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch((err) => {
        console.error('Error attempting to play audio:', err);
      });
    } else {
      audio.pause();
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const audio = localAudioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const stopPlayback = useCallback(() => {
    const audio = localAudioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback(
    (newVolume: number[]) => {
      const volumeValue = newVolume[0];
      setVolume(volumeValue);

      // Update mute state based on volume
      if (volumeValue === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  // Formatter function
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="">
      <audio ref={localAudioRef} src={meditation.audioUrl} preload="metadata" />

      <div className="aspect-video bg-meditation-primary/5 rounded-xl overflow-hidden mb-4 shadow-md h-auto w-full">
        {meditation.imageUrl ? (
          <div className="w-full h-full">
            <img src={meditation.imageUrl || '/placeholder.svg'} alt={meditation.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
            <img
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${meditation.name}`}
              alt={meditation.name}
              className="w-1/3 h-1/3 object-contain opacity-70"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-meditation-primary">{meditation.name}</h3>
        <span className="text-sm text-meditation-secondary font-medium">
          {formatTime(currentTime)} / {formatTime(meditation.duration)}
        </span>
      </div>

      <Slider
        value={[currentTime]}
        max={meditation.duration || 100}
        step={1}
        onValueChange={handleSeek}
        className="my-4 [&_.bg-secondary]:bg-meditation-primary/20 [&_.bg-primary]:bg-meditation-primary cursor-pointer"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button size="sm" variant="ghost" onClick={toggleMute} className="text-meditation-primary hover:bg-meditation-primary/70">
            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>

          {/* Always visible volume slider */}
          <div className="w-28 ml-2">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="cursor-pointer [&_.bg-secondary]:bg-meditation-primary/20 [&_.bg-primary]:bg-meditation-primary"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={stopPlayback}
            className="border-2 border-meditation-primary text-meditation-primary hover:bg-meditation-accent hover:text-white"
          >
            <StopCircle className="h-6 w-6" />
            <span className="sr-only">Stop</span>
          </Button>

          <Button size="lg" onClick={togglePlay} className="bg-meditation-primary hover:bg-meditation-secondary text-white flex items-center justify-center ">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';
