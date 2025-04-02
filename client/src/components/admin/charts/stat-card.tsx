'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  isLoading?: boolean;
  color?: string;
}

export function StatCard({ title, value, description, icon, isLoading = false, color = 'bg-meditation-primary/10' }: StatCardProps) {
  return (
    <Card className="border-2 border-meditation-primary/10 hover:border-meditation-primary/30 transition-all duration-300 overflow-hidden">
      <CardHeader className={`flex flex-row items-center justify-between pb-2 ${color} rounded-t-md`}>
        <CardTitle className="text-md font-medium text-meditation-primary">{title}</CardTitle>
        <div className="bg-white/80 p-2 rounded-full shadow-sm">{icon}</div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <motion.div
            className="text-2xl font-bold text-meditation-primary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {value}
          </motion.div>
        )}
        <CardDescription className="text-xs mt-1">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
