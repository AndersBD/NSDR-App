'use client';

import { ReactNode, useEffect, useState } from 'react';

interface AnimatedContentProps {
  isVisible: boolean;
  children: ReactNode;
  className?: string;
}

export function AnimatedContent({ isVisible, children, className = '' }: AnimatedContentProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>{children}</div>;
}
