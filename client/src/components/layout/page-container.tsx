import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center">
      <div className={`w-full max-w-2xl space-y-4 py-6 ${className}`}>{children}</div>
    </div>
  );
}
