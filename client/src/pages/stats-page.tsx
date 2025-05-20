'use client';

import { FeedbackDistributionChart } from '@/components/admin/charts/feedback-distribution-chart';
import { FeedbackTimelineChart } from '@/components/admin/charts/feedback-timeline-chart';
import { MeditationEffectivenessChart } from '@/components/admin/charts/meditation-effectiveness-chart';
import { SessionFeedbackDetails } from '@/components/admin/charts/session-feedback-details';
import { StatCard } from '@/components/admin/charts/stat-card';
import { PageTransition } from '@/components/animation/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { setCachedWellbeingOptions } from '@/lib/feedback-utils';
import { getClients, getFeedbackStats, getMeditationsForFeedback, getWellbeingOptions } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, Brain, CalendarClock, ChevronLeft, Filter, Leaf, PieChart, Shield, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';

type TimeRange = 'week' | 'month' | 'year' | 'all';

export default function StatsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');

  // Fetch clients for filtering
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  // Fetch wellbeing options first (for color system)
  const { data: wellbeingOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['wellbeing-options'],
    queryFn: getWellbeingOptions,
  });

  // Cache wellbeing options for the feedback color system
  useEffect(() => {
    if (wellbeingOptions && wellbeingOptions.length > 0) {
      setCachedWellbeingOptions(wellbeingOptions);
    }
  }, [wellbeingOptions]);

  // Fetch feedback data with client filter
  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    error: feedbackError,
  } = useQuery({
    queryKey: ['feedback-stats', timeRange, selectedClientId],
    queryFn: () => getFeedbackStats(timeRange, selectedClientId !== 'all' ? selectedClientId : undefined),
  });

  // Fetch meditation details for all feedback entries
  const { data: meditationsMap, isLoading: isLoadingMeditations } = useQuery({
    queryKey: ['meditations-for-feedback', feedbackData],
    queryFn: () => getMeditationsForFeedback(feedbackData || []),
    enabled: !!feedbackData && feedbackData.length > 0,
  });

  const isLoading = isLoadingFeedback || isLoadingMeditations || isLoadingOptions || isLoadingClients;

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

  // Get client name by ID
  const getClientName = (clientId: string) => {
    if (clientId === 'all') return 'Alle klienter';
    const client = clients.find((c) => c.id === clientId);
    return client ? client.client_name : 'Ukendt klient';
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="bg-meditation-primary text-white py-4 shadow-md">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <h1 className="text-xl font-bold">MindSpace Admin</h1>
              </div>
              <Button variant="ghost" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => setLocation('/admin')}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Tilbage til Dashboard
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-meditation-primary">Mindfulness Statistikker</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-meditation-primary" />
                <span className="text-sm text-meditation-secondary mr-2">Klient:</span>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="w-[200px] border-meditation-primary/20">
                    <SelectValue placeholder="Vælg klient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle klienter</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
              <Card className="border-2 border-meditation-primary/10 overflow-hidden">
                <CardHeader className=" border-b border-meditation-primary/10 py-4 meditation-header rounded-t-md">
                  <CardTitle className="text-lgflex items-center justify-between">
                    <span>Vælg tidsperiode</span>
                    {selectedClientId !== 'all' && (
                      <span className="text-sm font-normal bg-meditation-primary/20 px-3 py-1 rounded-full">{getClientName(selectedClientId)}</span>
                    )}
                  </CardTitle>
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
                  <TabsList className="grid grid-cols-4 w-full max-w-md">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span>Overblik</span>
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Trends</span>
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      <span>Feedback</span>
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
                        <CardHeader className="pb-2 bg-meditation-primary/5 border-b border-meditation-primary/10">
                          <CardTitle className="text-lg text-meditation-primary flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-meditation-primary/70" />
                            Wellness Trend
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          {isLoading ? (
                            <Skeleton className="w-full h-[300px] rounded-md" />
                          ) : (
                            <FeedbackTimelineChart
                              feedbackData={feedbackData || []}
                              wellbeingLabels={wellbeingLabels}
                              wellbeingOptions={wellbeingOptions || []}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                      <Card className="border-2 border-meditation-primary/10 h-full">
                        <CardHeader className="pb-2 bg-meditation-primary/5 border-b border-meditation-primary/10">
                          <CardTitle className="text-lg text-meditation-primary flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-meditation-primary/70" />
                            Fordeling af feedback
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          {isLoading ? (
                            <Skeleton className="w-full h-[300px] rounded-md" />
                          ) : (
                            <FeedbackDistributionChart
                              feedbackData={feedbackData || []}
                              wellbeingLabels={wellbeingLabels}
                              wellbeingOptions={wellbeingOptions || []}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {activeTab === 'trends' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card className="border-2 border-meditation-primary/10">
                      <CardHeader className="pb-2 bg-meditation-primary/5 border-b border-meditation-primary/10">
                        <CardTitle className="text-lg text-meditation-primary flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-meditation-primary/70" />
                          Effektivitet af meditationer
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {isLoading ? (
                          <Skeleton className="w-full h-[400px] rounded-md" />
                        ) : (
                          <MeditationEffectivenessChart
                            feedbackData={feedbackData || []}
                            meditationsMap={meditationsMap || {}}
                            wellbeingLabels={wellbeingLabels}
                            wellbeingOptions={wellbeingOptions || []}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'feedback' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {isLoading ? (
                      <Skeleton className="w-full h-[500px] rounded-md" />
                    ) : (
                      <SessionFeedbackDetails
                        feedbackData={feedbackData || []}
                        meditationsMap={meditationsMap || {}}
                        wellbeingLabels={wellbeingLabels}
                        wellbeingOptions={wellbeingOptions || []}
                      />
                    )}
                  </motion.div>
                )}

                {activeTab === 'sessions' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div>Sessions</div>
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
        </main>
      </div>
    </PageTransition>
  );
}
