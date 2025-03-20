
import { useEffect } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

interface MindfulTransitionProps {
  onComplete?: () => void;
  className?: string;
}

export function MindfulTransition({ onComplete, className }: MindfulTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const animationData = {
    // Animation data will be injected here from the .lottie file
  };

  return (
    <div className={cn("fixed inset-0 flex items-center justify-center bg-white/90 z-50", className)}>
      <div className="w-64 h-64">
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay={true}
        />
      </div>
    </div>
  );
}
