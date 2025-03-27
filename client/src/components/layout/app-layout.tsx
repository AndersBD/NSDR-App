import type { ReactNode } from 'react';
import { PageContainer } from './page-container';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return <PageContainer>{children}</PageContainer>;
}
