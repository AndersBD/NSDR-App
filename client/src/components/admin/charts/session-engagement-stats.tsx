'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SessionStats } from '@/services/sessionEventService';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, PlayCircle, TrendingUp } from 'lucide-react';

interface SessionEngagementStatsProps {
  sessionStatsData: SessionStats | null | undefined;
  isLoading: boolean;
}

const StatDisplay = ({
  icon,
  label,
  value,
  unit = '',
  color = 'text-meditation-primary',
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  isLoading: boolean;
}) => (
  <motion.div
    className="bg-gradient-to-br from-meditation-primary/5 via-white to-meditation-muted/10 p-6 rounded-lg shadow-sm border border-meditation-primary/10 flex flex-col justify-between h-full"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {isLoading ? (
      <>
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-8 w-3/4" />
      </>
    ) : (
      <>
        <div className="flex items-center text-meditation-secondary mb-2">
          {icon}
          <span className="ml-2 text-sm font-medium">{label}</span>
        </div>
        <p className={`text-3xl font-bold ${color}`}>
          {value}
          {unit && <span className="text-xl ml-1">{unit}</span>}
        </p>
      </>
    )}
  </motion.div>
);

export function SessionEngagementStats({ sessionStatsData, isLoading }: SessionEngagementStatsProps) {
  const completionRate =
    sessionStatsData && sessionStatsData.totalStarted > 0 ? ((sessionStatsData.totalCompleted / sessionStatsData.totalStarted) * 100).toFixed(1) : '0.0';

  if (isLoading) {
    return (
      <Card className="border-2 border-meditation-primary/10">
        <CardHeader className="pb-4 bg-meditation-primary/5 border-b border-meditation-primary/10">
          <CardTitle className="text-lg text-meditation-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-meditation-primary/70" />
            Session Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <StatDisplay isLoading={true} icon={<PlayCircle className="h-5 w-5" />} label="Startede Sessioner" value="..." />
            <StatDisplay isLoading={true} icon={<CheckCircle className="h-5 w-5" />} label="Fuldførte Sessioner" value="..." />
            <StatDisplay isLoading={true} icon={<TrendingUp className="h-5 w-5" />} label="Fuldførelsesrate" value="..." unit="%" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sessionStatsData) {
    return (
      <Card className="border-2 border-meditation-primary/10">
        <CardHeader className="pb-4 bg-meditation-primary/5 border-b border-meditation-primary/10">
          <CardTitle className="text-lg text-meditation-primary flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Session Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-meditation-secondary">Ingen data om session engagement tilgængelig.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-meditation-primary/10 shadow-lg overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-meditation-primary/80 to-meditation-primary/60 text-white rounded-t-md">
        <CardTitle className="text-xl flex items-center gap-3">
          <TrendingUp className="h-6 w-6" />
          Session Engagement Overblik
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <div className="grid md:grid-cols-3 gap-6">
          <StatDisplay
            isLoading={isLoading}
            icon={<PlayCircle className="h-5 w-5 text-blue-500" />}
            label="Startede Sessioner"
            value={sessionStatsData.totalStarted}
            color="text-blue-600"
          />
          <StatDisplay
            isLoading={isLoading}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            label="Fuldførte Sessioner"
            value={sessionStatsData.totalCompleted}
            color="text-green-600"
          />
          <StatDisplay
            isLoading={isLoading}
            icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
            label="Fuldførelsesrate"
            value={completionRate}
            unit="%"
            color="text-purple-600"
          />
        </div>
        {sessionStatsData.totalStarted > 0 && (
          <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 className="text-sm font-medium text-meditation-secondary mb-2 text-center">Fuldførelsesrate Visualisering</h3>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border border-gray-300 shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-teal-500 h-6 flex items-center justify-center text-white text-xs font-semibold"
                style={{ width: `${completionRate}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
              >
                {completionRate}%
              </motion.div>
            </div>
            <p className="text-xs text-meditation-secondary mt-2 text-center">
              {sessionStatsData.totalCompleted} ud af {sessionStatsData.totalStarted} sessioner blev fuldført.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
