'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface MindfulTransitionProps {
  onComplete?: () => void;
  className?: string;
}

export function MindfulTransition({ onComplete, className }: MindfulTransitionProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence of steps for the transition animation
    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 2000);
    const timer3 = setTimeout(() => setStep(3), 3500);
    const timer4 = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className={cn('fixed inset-0 flex flex-col items-center justify-center bg-white z-50 transition-all duration-1000', className)}>
      <div className="relative flex flex-col items-center">
        {/* Breathing circle animation */}
        <div className="relative mb-8">
          <div
            className={cn(
              'absolute rounded-full transition-all duration-[4s] ease-in-out',
              step >= 1 ? 'opacity-10' : 'opacity-0',
              'bg-meditation-primary w-64 h-64 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2',
              step >= 1 && 'animate-breathe'
            )}
          />
          <div
            className={cn(
              'absolute rounded-full transition-all duration-[3s] ease-in-out',
              step >= 1 ? 'opacity-20' : 'opacity-0',
              'bg-meditation-primary w-48 h-48 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2',
              step >= 1 && 'animate-breathe delay-500'
            )}
          />
          <div
            className={cn(
              'absolute rounded-full transition-all duration-[2s] ease-in-out',
              step >= 1 ? 'opacity-30' : 'opacity-0',
              'bg-meditation-primary w-32 h-32 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2',
              step >= 1 && 'animate-breathe delay-1000'
            )}
          />

          {/* Center dot */}
          <div className="relative w-16 h-16">
            <div
              className={cn(
                'absolute rounded-full bg-meditation-primary w-4 h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'transition-all duration-1000',
                step === 0 && 'scale-0',
                step >= 1 && 'scale-100'
              )}
            />
          </div>
        </div>

        {/* Text messages */}
        <p
          className={cn(
            'text-meditation-primary text-xl font-medium transition-all duration-1000',
            step < 1 && 'opacity-0 translate-y-4',
            step >= 1 && 'opacity-100 translate-y-0'
          )}
        >
          Tak for din meditation
        </p>

        <p
          className={cn(
            'text-meditation-secondary mt-2 transition-all duration-1000',
            step < 2 && 'opacity-0 translate-y-4',
            step >= 2 && 'opacity-100 translate-y-0'
          )}
        >
          Tag den ro du har fundet med dig videre...
        </p>

        <p
          className={cn(
            'text-meditation-secondary mt-2 transition-all duration-1000',
            step < 3 && 'opacity-0 translate-y-4',
            step >= 3 && 'opacity-100 translate-y-0'
          )}
        >
          Vender tilbage til forsiden...
        </p>
      </div>
    </div>
  );
}
