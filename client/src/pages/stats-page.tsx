'use client';

import { PageTransition } from '@/components/animation/page-transition';
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
import { motion } from 'framer-motion';
import { BarChart3, Brain, CalendarClock, ChevronLeft, Leaf, PieChart, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';

type TimeRange = 'week' | 'month' | 'year' | 'all';

export default function StatsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [activeTab, setActiveTab] = useState<string>('overview');

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
      totalSessions > 0 ? Number.parseFloat((feedbackData.reduce((sum, item) => sum + item.wellbeing_change, 0) / totalSessions).toFixed(2)) : 0;

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

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6 ">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-meditation-primary hover:bg-meditation-primary/10 flex items-center gap-2 pl-2"
            onClick={() => setLocation('/mindspace/admin')}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Tilbage</span>
          </Button>
          <motion.h1
            className="text-2xl font-semibold text-meditation-primary"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Mindfulness Statistikker
          </motion.h1>
          <div className="w-[88px]"></div> {/* Spacer for balance */}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <Card className="border-2 border-meditation-primary/10 overflow-hidden">
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
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div custom={0} variants={fadeInVariants} initial="hidden" animate="visible">
            <StatCard
              title="Sessioner"
              value={isLoading ? '...' : `${stats?.totalSessions || 0}`}
              description="Total antal meditationer"
              icon={<Users className="h-5 w-5 text-meditation-primary" />}
              isLoading={isLoading}
              color="bg-gradient-to-br from-meditation-primary/10 to-meditation-muted/20"
            />
          </motion.div>

          <motion.div custom={1} variants={fadeInVariants} initial="hidden" animate="visible">
            <StatCard
              title="Gennemsnitlig ændring"
              value={isLoading ? '...' : `${stats?.averageWellbeing || 0}`}
              description="Gennemsnitlig wellness-ændring"
              icon={<TrendingUp className="h-5 w-5 text-meditation-primary" />}
              isLoading={isLoading}
              color="bg-gradient-to-br from-meditation-primary/10 to-meditation-muted/20"
            />
          </motion.div>

          <motion.div custom={2} variants={fadeInVariants} initial="hidden" animate="visible">
            <StatCard
              title="Positive resultater"
              value={isLoading ? '...' : `${stats?.positiveRate || 0}%`}
              description="Sessioner med positiv effekt"
              icon={<Leaf className="h-5 w-5 text-meditation-primary" />}
              isLoading={isLoading}
              color="bg-gradient-to-br from-meditation-primary/10 to-meditation-muted/20"
            />
          </motion.div>

          <motion.div custom={3} variants={fadeInVariants} initial="hidden" animate="visible">
            <StatCard
              title="Seneste session"
              value={isLoading ? '...' : formatDateForDisplay(stats?.lastSessionDate || null)}
              description="Dato for seneste meditation"
              icon={<CalendarClock className="h-5 w-5 text-meditation-primary" />}
              isLoading={isLoading}
              color="bg-gradient-to-br from-meditation-primary/10 to-meditation-muted/20"
            />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>Overblik</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Trends</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Sessioner</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {activeTab === 'overview' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                  <Card className="border-2 border-meditation-primary/10 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-meditation-primary flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-meditation-primary/70" />
                        Wellness Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {isLoading ? (
                        <Skeleton className="w-full h-[300px] rounded-md" />
                      ) : (
                        <FeedbackTimelineChart feedbackData={feedbackData || []} wellbeingLabels={wellbeingLabels} />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                  <Card className="border-2 border-meditation-primary/10 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-meditation-primary flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-meditation-primary/70" />
                        Fordeling af feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {isLoading ? (
                        <Skeleton className="w-full h-[300px] rounded-md" />
                      ) : (
                        <FeedbackDistributionChart feedbackData={feedbackData || []} wellbeingLabels={wellbeingLabels} />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {activeTab === 'trends' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="border-2 border-meditation-primary/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-meditation-primary flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-meditation-primary/70" />
                      Effektivitet af meditationer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {isLoading ? (
                      <Skeleton className="w-full h-[400px] rounded-md" />
                    ) : (
                      <MeditationEffectivenessChart feedbackData={feedbackData || []} meditationsMap={meditationsMap || {}} wellbeingLabels={wellbeingLabels} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {isLoading ? (
                  <Skeleton className="w-full h-[500px] rounded-md" />
                ) : (
                  <SessionFeedbackDetails feedbackData={feedbackData || []} meditationsMap={meditationsMap || {}} wellbeingLabels={wellbeingLabels} />
                )}
              </motion.div>
            )}
          </Tabs>
        </motion.div>

        <motion.p
          className="text-center text-meditation-secondary italic text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          "Meditation er ikke at flygte fra livet, men at forberede sig til at møde det fuldt ud"
        </motion.p>
      </div>
    </PageTransition>
  );
}
