'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
    <div className={cn('fixed inset-0 flex flex-col items-center justify-center bg-white z-50', className)}>
      <div className="relative flex flex-col items-center">
        {/* Breathing circle animation */}
        <div className="relative mb-8">
          <motion.div
            className="absolute rounded-full bg-meditation-primary -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: step >= 1 ? 0.1 : 0,
              scale: step >= 1 ? [1, 1.05, 1] : 0,
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            style={{ width: '16rem', height: '16rem' }}
          />

          <motion.div
            className="absolute rounded-full bg-meditation-primary -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: step >= 1 ? 0.2 : 0,
              scale: step >= 1 ? [1, 1.05, 1] : 0,
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: 0.5,
            }}
            style={{ width: '12rem', height: '12rem' }}
          />

          <motion.div
            className="absolute rounded-full bg-meditation-primary -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: step >= 1 ? 0.3 : 0,
              scale: step >= 1 ? [1, 1.05, 1] : 0,
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: 1,
            }}
            style={{ width: '8rem', height: '8rem' }}
          />

          {/* Center dot */}
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute rounded-full bg-meditation-primary w-4 h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0 }}
              animate={{ scale: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Text messages */}
        <motion.p
          className="text-meditation-primary text-xl font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: step >= 1 ? 1 : 0,
            y: step >= 1 ? 0 : 10,
          }}
          transition={{ duration: 0.8 }}
        >
          Tak for din meditation
        </motion.p>

        <motion.p
          className="text-meditation-secondary mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: step >= 2 ? 1 : 0,
            y: step >= 2 ? 0 : 10,
          }}
          transition={{ duration: 0.8 }}
        >
          Tag den ro du har fundet med dig videre...
        </motion.p>

        <motion.p
          className="text-meditation-secondary mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: step >= 3 ? 1 : 0,
            y: step >= 3 ? 0 : 10,
          }}
          transition={{ duration: 0.8 }}
        >
          Vender tilbage til forsiden...
        </motion.p>
      </div>
    </div>
  );
}
