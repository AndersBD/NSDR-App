
import { useEffect } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';
import meditationAnimation from '../assets/meditation-animation.json';

interface MindfulTransitionProps {
  onComplete?: () => void;
  className?: string;
}

export function MindfulTransition({ onComplete, className }: MindfulTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={cn("fixed inset-0 flex items-center justify-center bg-white/90 z-50", className)}>
      <div className="w-64 h-64">
        <Lottie
          animationData={meditationAnimation}
          loop={false}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
