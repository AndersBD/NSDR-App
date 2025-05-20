'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailedSessionEngagement, SessionStats } from '@/services/sessionEventService';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ImageOff, ListFilter, PlayCircle, SortAsc, SortDesc, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

interface SessionEngagementStatsProps {
  overallStatsData: SessionStats | null | undefined;
  isLoadingOverallStats: boolean;
  detailedStatsData: DetailedSessionEngagement[] | null | undefined;
  isLoadingDetailedStats: boolean;
}

type SortKey = 'name' | 'totalStarted' | 'totalCompleted' | 'completionRate';
type SortDirection = 'asc' | 'desc';

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
        <Skeleton className="h-6 w-3/5 mb-2" />
        <Skeleton className="h-10 w-4/5" />
      </>
    ) : (
      <>
        <div className="flex items-center text-meditation-secondary mb-2">
          {icon}
          <span className="ml-2 text-sm font-medium truncate" title={label}>
            {label}
          </span>
        </div>
        <p className={`text-3xl font-bold ${color} truncate`} title={`${value}${unit}`}>
          {value}
          {unit && <span className="text-xl ml-1">{unit}</span>}
        </p>
      </>
    )}
  </motion.div>
);

export function SessionEngagementStats({ overallStatsData, isLoadingOverallStats, detailedStatsData, isLoadingDetailedStats }: SessionEngagementStatsProps) {
  const [sortKey, setSortKey] = useState<SortKey>('totalStarted');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const overallCompletionRate =
    overallStatsData && overallStatsData.totalStarted > 0 ? ((overallStatsData.totalCompleted / overallStatsData.totalStarted) * 100).toFixed(1) : '0.0';

  const sortedDetailedStats = useMemo(() => {
    if (!detailedStatsData) return [];
    return [...detailedStatsData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'name') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
        return sortDirection === 'asc' ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
      }
      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [detailedStatsData, sortKey, sortDirection]);

  const handleSortChange = (newSortKey: SortKey) => {
    if (newSortKey === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(newSortKey);
      setSortDirection('desc');
    }
  };

  const SortButton = ({ forSortKey, children }: { forSortKey: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => handleSortChange(forSortKey)}
      className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 transition-colors
                  ${sortKey === forSortKey ? 'bg-meditation-primary text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-meditation-secondary'}`}
    >
      {children}
      {sortKey === forSortKey && (sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
    </button>
  );

  return (
    <div className="space-y-8">
      <Card className="border-2 border-meditation-primary/10 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-meditation-primary/80 to-meditation-primary/60 text-white rounded-t-md">
          <CardTitle className="text-xl flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            Samlet Session Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          {isLoadingOverallStats ? (
            <div className="grid md:grid-cols-3 gap-6">
              <StatDisplay isLoading={true} icon={<PlayCircle className="h-5 w-5" />} label="Startede Sessioner" value="0" />
              <StatDisplay isLoading={true} icon={<CheckCircle className="h-5 w-5" />} label="Fuldførte Sessioner" value="0" />
              <StatDisplay isLoading={true} icon={<TrendingUp className="h-5 w-5" />} label="Fuldførelsesrate" value="0" unit="%" />
            </div>
          ) : overallStatsData ? (
            <div className="grid md:grid-cols-3 gap-6">
              <StatDisplay
                isLoading={false}
                icon={<PlayCircle className="h-5 w-5 text-blue-500" />}
                label="Startede Sessioner"
                value={overallStatsData.totalStarted}
                color="text-blue-600"
              />
              <StatDisplay
                isLoading={false}
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                label="Fuldførte Sessioner"
                value={overallStatsData.totalCompleted}
                color="text-green-600"
              />
              <StatDisplay
                isLoading={false}
                icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
                label="Fuldførelsesrate"
                value={overallCompletionRate}
                unit="%"
                color="text-purple-600"
              />
            </div>
          ) : (
            <p className="text-meditation-secondary text-center py-4">Ingen overordnet data tilgængelig.</p>
          )}
          {overallStatsData && overallStatsData.totalStarted > 0 && !isLoadingOverallStats && (
            <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h3 className="text-sm font-medium text-meditation-secondary mb-2 text-center">Samlet Fuldførelsesrate Visualisering</h3>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border border-gray-300 shadow-inner">
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-teal-500 h-6 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${overallCompletionRate}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallCompletionRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                >
                  {overallCompletionRate}%
                </motion.div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-meditation-primary/10 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-meditation-accent/80 to-meditation-accent/60 text-white rounded-t-md">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-3">
              <ListFilter className="h-6 w-6" />
              Detaljeret Session Performance
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-white space-y-4">
          <div className="flex flex-wrap gap-2 mb-6 items-center border-b pb-4 border-gray-200">
            <span className="text-sm font-medium text-meditation-secondary mr-2">Sorter efter:</span>
            <SortButton forSortKey="name">Navn</SortButton>
            <SortButton forSortKey="totalStarted">Startet</SortButton>
            <SortButton forSortKey="totalCompleted">Fuldført</SortButton>
            <SortButton forSortKey="completionRate">Rate</SortButton>
          </div>

          {isLoadingDetailedStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                  <div className="flex items-center gap-4 mb-3">
                    <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-1/3 mb-1.5" />
                  <Skeleton className="h-4 w-1/3 mb-1.5" />
                  <Skeleton className="h-4 w-1/3 mb-1.5" />
                  <Skeleton className="h-3 w-full mt-3 rounded-full" />
                </Card>
              ))}
            </div>
          )}

          {!isLoadingDetailedStats && sortedDetailedStats && sortedDetailedStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {sortedDetailedStats.map((session) => (
                <motion.div
                  key={session.id}
                  className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg hover:scale-y-50 transition-all duration-300 bg-white flex flex-col group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.random() * 0.2 }}
                >
                  <div className="flex items-start gap-4 mb-3">
                    {session.imageUrl ? (
                      <img src={session.imageUrl} alt={session.name} className="w-25 h-20 object-cover rounded-lg flex-shrink-0 shadow-md" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0 shadow-inner">
                        <ImageOff className="w-10 h-10" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pt-1">
                      <h4
                        className="text-base font-semibold text-meditation-primary group-hover:text-meditation-accent transition-colors duration-300 truncate"
                        title={session.name}
                      >
                        {session.name}
                      </h4>
                      {session.duration && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {Math.round(session.duration / 60)} min
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-meditation-secondary mb-3">
                    <p>
                      Startet: <span className="font-semibold text-blue-600">{session.totalStarted}</span>
                    </p>
                    <p>
                      Fuldført: <span className="font-semibold text-green-600">{session.totalCompleted}</span>
                    </p>
                    <p>
                      Rate: <span className="font-semibold text-purple-600">{session.completionRate.toFixed(1)}%</span>
                    </p>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 mt-auto overflow-hidden border border-gray-300 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-green-400 to-teal-500 h-full text-white text-xxs flex items-center justify-center font-bold"
                      style={{ width: `${session.completionRate.toFixed(1)}%` }}
                      title={`${session.completionRate.toFixed(1)}% Fuldført`}
                    >
                      {session.completionRate >= 15 && `${session.completionRate.toFixed(0)}%`}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoadingDetailedStats && (!sortedDetailedStats || sortedDetailedStats.length === 0) && (
            <div className="text-center py-12">
              <ListFilter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-meditation-secondary text-lg">Ingen detaljeret session data.</p>
              <p className="text-sm text-gray-400">Prøv at justere filtrene eller vent på nye sessionsdata.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
