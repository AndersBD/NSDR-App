'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedContentProps {
  isVisible: boolean;
  children: ReactNode;
  className?: string;
}

export function AnimatedContent({ isVisible, children, className = '' }: AnimatedContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
        scale: isVisible ? 1 : 0.98,
      }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
