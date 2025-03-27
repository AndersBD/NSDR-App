'use client';

import { FeedbackDistributionChart } from '@/components/charts/feedback-distribution-chart';
import { FeedbackTimelineChart } from '@/components/charts/feedback-timeline-chart';
import { MeditationEffectivenessChart } from '@/components/charts/meditation-effectiveness-chart';
import { SessionFeedbackDetails } from '@/components/charts/session-feedback-details';
import { StatCard } from '@/components/charts/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getFeedbackStats, getMeditationsForFeedback, getWellbeingOptions } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, ChevronLeft, LineChart, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';

type TimeRange = 'week' | 'month' | 'year' | 'all';

export default function StatsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Fetch feedback data
  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    error: feedbackError,
  } = useQuery({
    queryKey: ['feedback-stats', timeRange],
    queryFn: () => getFeedbackStats(timeRange),
  });

  // Fetch meditation details for all feedback entries
  const { data: meditationsMap, isLoading: isLoadingMeditations } = useQuery({
    queryKey: ['meditations-for-feedback', feedbackData],
    queryFn: () => getMeditationsForFeedback(feedbackData || []),
    enabled: !!feedbackData && feedbackData.length > 0,
  });

  const { data: wellbeingOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['wellbeing-options'],
    queryFn: getWellbeingOptions,
  });

  const isLoading = isLoadingFeedback || isLoadingMeditations || isLoadingOptions;

  const wellbeingLabels = useMemo(() => {
    if (!wellbeingOptions) return {};
    return Object.fromEntries(wellbeingOptions.map((option) => [option.value, option.label]));
  }, [wellbeingOptions]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!feedbackData) return null;

    const totalSessions = feedbackData.length;
    const averageWellbeing =
      totalSessions > 0 ? parseFloat((feedbackData.reduce((sum, item) => sum + item.wellbeing_change, 0) / totalSessions).toFixed(2)) : 0;

    const positiveChanges = feedbackData.filter((item) => item.wellbeing_change > 0).length;
    const positiveRate = totalSessions > 0 ? Math.round((positiveChanges / totalSessions) * 100) : 0;

    const lastSessionDate = feedbackData.length > 0 ? new Date(feedbackData[feedbackData.length - 1].created_at) : null;

    return {
      totalSessions,
      averageWellbeing,
      positiveRate,
      lastSessionDate,
    };
  }, [feedbackData]);

  // Show error toast if data fetching fails
  useEffect(() => {
    if (feedbackError) {
      toast({
        title: 'Error',
        description: 'Failed to load feedback data',
        variant: 'destructive',
      });
      console.error('Feedback data load error:', feedbackError);
    }
  }, [feedbackError, toast]);

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('da-DK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container mx-auto px-6 py-6 ">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" className="text-meditation-primary hover:bg-meditation-primary/10" onClick={() => setLocation('/')}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Tilbage
        </Button>
        <h1 className="text-2xl font-semibold text-meditation-primary">Wellness Statistik</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="meditation-header pb-4 rounded-t-md">
          <CardTitle className="text-xl text-center">Vælg tidsperiode</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)} className="w-full">
            <TabsList className="grid grid-cols-4 mb-0">
              <TabsTrigger value="week">Uge</TabsTrigger>
              <TabsTrigger value="month">Måned</TabsTrigger>
              <TabsTrigger value="year">År</TabsTrigger>
              <TabsTrigger value="all">Alle</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Sessioner"
          value={isLoading ? '...' : `${stats?.totalSessions || 0}`}
          description="Total antal meditationer"
          icon={<Users className="h-5 w-5 text-meditation-primary" />}
          isLoading={isLoading}
        />

        <StatCard
          title="Gennemsnitlig ændring"
          value={isLoading ? '...' : `${stats?.averageWellbeing || 0}`}
          description="Gennemsnitlig wellness-ændring"
          icon={<TrendingUp className="h-5 w-5 text-meditation-primary" />}
          isLoading={isLoading}
        />

        <StatCard
          title="Positive resultater"
          value={isLoading ? '...' : `${stats?.positiveRate || 0}%`}
          description="Sessioner med positiv effekt"
          icon={<LineChart className="h-5 w-5 text-meditation-primary" />}
          isLoading={isLoading}
        />

        <StatCard
          title="Seneste session"
          value={isLoading ? '...' : formatDateForDisplay(stats?.lastSessionDate || null)}
          description="Dato for seneste meditation"
          icon={<CalendarClock className="h-5 w-5 text-meditation-primary" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 mb-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-meditation-primary">Wellness Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <FeedbackTimelineChart feedbackData={feedbackData || []} wellbeingLabels={wellbeingLabels} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-meditation-primary">Fordeling af feedback</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="w-full h-[300px] rounded-md" />
            ) : (
              <FeedbackDistributionChart feedbackData={feedbackData || []} wellbeingLabels={wellbeingLabels} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-meditation-primary">Effektivitet af meditationer</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <Skeleton className="w-full h-[400px] rounded-md" />
          ) : (
            <MeditationEffectivenessChart feedbackData={feedbackData || []} meditationsMap={meditationsMap || {}} wellbeingLabels={wellbeingLabels} />
          )}
        </CardContent>
      </Card>

      {/* Session feedback details component */}
      <div className="my-6">
        {isLoading ? (
          <Skeleton className="w-full h-[500px] rounded-md" />
        ) : (
          <SessionFeedbackDetails feedbackData={feedbackData || []} meditationsMap={meditationsMap || {}} wellbeingLabels={wellbeingLabels} />
        )}
      </div>

      <p className="text-center text-meditation-secondary italic text-sm mt-6">
        Disse statistikker hjælper med at evaluere effektiviteten af dine meditationssessioner over tid
      </p>
    </div>
  );
}
