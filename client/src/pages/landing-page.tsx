'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function MindSpaceWelcome() {
  const [, setLocation] = useLocation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-xl space-y-2 px-4">
        {/* Welcome Text */}
        <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-4xl font-medium text-meditation-primary mb-0">VELKOMMEN TIL</h1>
        </motion.div>

        {/* Logo Image */}
        <motion.div
          className="relative mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="relative w-72 h-72 mx-auto flex flex-col items-center">
            {/* Shadow first (positioned below the image) */}
            <div
              className="absolute bottom-1 left-1/2 w-56 h-8 -translate-x-1/2 translate-y-1 bg-black/20 rounded-[50%] blur-md"
              style={{
                filter: 'blur(5px)',
                transform: 'translateX(-50%) translateY(2px)',
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 70%)',
                width: '70%',
              }}
            ></div>

            {/* Image on top */}
            <img src="/landing-logo.png" alt="MindSpace Logo" className="w-full h-full object-contain relative z-10" />
          </div>
        </motion.div>

        {/* MindSpace Text */}
        <motion.div className="text-center mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
          <h2 className="text-7xl md:text-8xl text-meditation-primary relative inline-flex tracking-normal">
            <span className="font-bold">Mind</span>
            <span className="font-normal">Space</span>
            <span className="text-sm absolute top-0 right-0 translate-x-1">TM</span>
          </h2>
        </motion.div>

        {/* Start Button */}
        <motion.div className="mt-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}>
          <Button
            size="lg"
            className="w-full font-bold max-w-xs mx-auto mt-12 py-6 text-xl bg-meditation-primary hover:bg-meditation-primary/90 text-white rounded-full flex items-center justify-center"
            onClick={() => setLocation('/welcome')}
          >
            Start
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
