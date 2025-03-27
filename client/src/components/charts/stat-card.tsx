import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  isLoading?: boolean;
}

export function StatCard({ title, value, description, icon, isLoading = false }: StatCardProps) {
  return (
    <Card className="border-2 border-meditation-primary/10 hover:border-meditation-primary/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium text-meditation-primary">{title}</CardTitle>
        <div className="bg-meditation-primary/10 p-2 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-28" /> : <div className="text-2xl font-bold text-meditation-primary">{value}</div>}
        <CardDescription className="text-xs mt-1">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
