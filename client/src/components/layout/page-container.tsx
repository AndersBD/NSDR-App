import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center">
      <div className={`w-full max-w-7xl space-y-4 py-6 px-4 ${className}`}>{children}</div>
    </div>
  );
}
