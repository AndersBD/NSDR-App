import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StorageFile } from '@/lib/supabase';
import { BarChart, Calendar, Clock, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Strong typing for feedback data
interface FeedbackEntry {
  storage_object_id: string;
  wellbeing_change: number;
  created_at: string;
}

interface WellbeingDistribution {
  [key: string]: number;
}

interface SessionStats {
  total: number;
  avgWellbeing: number;
  positivePercentage: number;
  lastUsed: Date;
  distribution: WellbeingDistribution;
  selectedMeditation: StorageFile | null;
}

interface TimelineDataPoint {
  date: string;
  wellbeing: number;
}

interface SessionFeedbackDetailsProps {
  feedbackData: FeedbackEntry[];
  meditationsMap: Record<string, StorageFile | null>;
  wellbeingLabels: Record<string, string>;
}

// Utility functions - moved outside component for reusability and cleaner code
const getWellbeingColor = (value: number): string => {
  // Common color palette function that can be shared across components
  if (value < 0) {
    // Negative values: red to orange gradient
    const intensity = Math.min(1, Math.abs(value) / 2);
    return `rgba(229, ${115 + 115 * (1 - intensity)}, ${115 + 30 * (1 - intensity)}, 1)`;
  } else if (value === 0) {
    // Neutral: blue
    return '#90caf9';
  } else {
    // Positive values: light green to dark green gradient
    const intensity = Math.min(1, value / 2);
    return `rgba(${129 - 55 * intensity}, ${199 - 75 * intensity}, ${132 - 60 * intensity}, 1)`;
  }
};

const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(
    'da-DK',
    options || {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(date);
};

// Pure function to calculate statistics - easier to test and reason about
const calculateSessionStats = (
  sessionFeedback: FeedbackEntry[],
  selectedSessionId: string,
  meditationsMap: Record<string, StorageFile | null>,
  wellbeingLabels: Record<string, string>
): SessionStats | null => {
  if (!sessionFeedback.length) return null;

  const total = sessionFeedback.length;
  const avgWellbeing = parseFloat((sessionFeedback.reduce((sum, item) => sum + item.wellbeing_change, 0) / total).toFixed(2));
  const positiveCount = sessionFeedback.filter((item) => item.wellbeing_change > 0).length;
  const positivePercentage = Math.round((positiveCount / total) * 100);
  const lastUsed = new Date(sessionFeedback[sessionFeedback.length - 1].created_at);

  // Initialize distribution with ALL possible wellbeing values from labels
  const distribution: WellbeingDistribution = {};
  Object.keys(wellbeingLabels).forEach((value) => {
    distribution[value] = 0;
  });

  // Count occurrences
  sessionFeedback.forEach((item) => {
    const value = item.wellbeing_change.toString();
    distribution[value] = (distribution[value] || 0) + 1;
  });

  return {
    total,
    avgWellbeing,
    positivePercentage,
    lastUsed,
    distribution,
    selectedMeditation: meditationsMap[selectedSessionId],
  };
};

// Function to prepare distribution data for rendering
const prepareDistributionData = (sessionStats: SessionStats | null, wellbeingLabels: Record<string, string>) => {
  if (!sessionStats) return [];

  return Object.keys(wellbeingLabels)
    .sort((a, b) => parseInt(a) - parseInt(b)) // Sort by numeric value
    .map((value) => {
      const numericValue = parseInt(value);
      const count = sessionStats.distribution[value] || 0;
      const percent = Math.round((count / sessionStats.total) * 100);

      return {
        value: numericValue,
        stringValue: value,
        count,
        percent,
        label: wellbeingLabels[value] || `Value ${value}`,
        color: getWellbeingColor(numericValue),
      };
    });
};

// Custom tooltip component - extracted for clarity
const TimelineTooltip = ({ active, payload, label, wellbeingLabels }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const wellbeingLabel = wellbeingLabels[value] || `Value ${value}`;

    return (
      <div className="bg-white p-3 border border-meditation-primary/20 rounded-md shadow">
        <p className="font-medium text-sm">{formatDate(label)}</p>
        <p className="text-meditation-secondary text-sm">
          Score: <span className="font-medium">{value}</span>
        </p>
        <p className="text-meditation-secondary text-sm">
          Vurdering: <span className="font-medium">{wellbeingLabel}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function SessionFeedbackDetails({ feedbackData, meditationsMap, wellbeingLabels }: SessionFeedbackDetailsProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Organize meditations for selection dropdown - memoized for performance
  const sessions = useMemo(() => {
    const sessionsMap: Record<string, { id: string; name: string; count: number }> = {};

    feedbackData.forEach((item) => {
      const id = item.storage_object_id;
      const meditation = meditationsMap[id];

      if (!meditation) return;

      if (!sessionsMap[id]) {
        sessionsMap[id] = {
          id,
          name: meditation.name,
          count: 0,
        };
      }

      sessionsMap[id].count += 1;
    });

    return Object.values(sessionsMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [feedbackData, meditationsMap]);

  // Set initial selection and handle loading state
  useEffect(() => {
    if (sessions.length > 0) {
      if (!selectedSessionId) {
        setSelectedSessionId(sessions[0].id);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [sessions, selectedSessionId]);

  // Filter feedback for selected session
  const sessionFeedback = useMemo(() => {
    if (!selectedSessionId) return [];

    return feedbackData
      .filter((item) => item.storage_object_id === selectedSessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [feedbackData, selectedSessionId]);

  // Calculate statistics using pure function
  const sessionStats = useMemo(
    () => calculateSessionStats(sessionFeedback, selectedSessionId, meditationsMap, wellbeingLabels),
    [sessionFeedback, selectedSessionId, meditationsMap, wellbeingLabels]
  );

  // Prepare distribution data for rendering
  const distributionData = useMemo(() => prepareDistributionData(sessionStats, wellbeingLabels), [sessionStats, wellbeingLabels]);

  // Prepare timeline data
  const timelineData = useMemo((): TimelineDataPoint[] => {
    if (!sessionFeedback.length) return [];

    const dateGroups: Record<string, TimelineDataPoint> = {};

    sessionFeedback.forEach((item) => {
      const date = new Date(item.created_at);
      const dateKey = date.toISOString().split('T')[0];

      dateGroups[dateKey] = {
        date: dateKey,
        wellbeing: item.wellbeing_change,
      };
    });

    return Object.values(dateGroups).sort((a, b) => a.date.localeCompare(b.date));
  }, [sessionFeedback]);

  // Calculate Y-axis domain based on available wellbeing options
  const getYAxisDomain = useMemo(() => {
    const values = Object.keys(wellbeingLabels).map((val) => parseInt(val));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min, max];
  }, [wellbeingLabels]);

  const formatChartTick = (value: any): string => {
    return formatDate(value);
  };

  // Empty state
  if (!isLoading && sessions.length === 0) {
    return (
      <Card className="bg-meditation-primary/5">
        <CardContent className="p-6 text-center">
          <p className="text-meditation-secondary">Ingen meditation feedback tilgængelig</p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-meditation-primary">Session Specifik Feedback</CardTitle>
          <CardDescription>Indlæser data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-[200px] w-full mb-6" />
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-meditation-primary">Session Specifik Feedback</CardTitle>
        <CardDescription>Vælg en meditation for at se detaljeret feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
          <SelectTrigger className="w-full mb-6 border-meditation-primary/30">
            <SelectValue placeholder="Vælg en meditation" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name} ({session.count} feedbacks)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {sessionStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-meditation-primary/10 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-meditation-secondary">Antal Sessioner</p>
                    <p className="text-xl font-semibold text-meditation-primary mt-1">{sessionStats.total}</p>
                  </div>
                  <BarChart className="h-5 w-5 text-meditation-primary opacity-70" />
                </div>
              </div>

              <div className="bg-meditation-primary/10 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-meditation-secondary">Gennemsnit</p>
                    <p className="text-xl font-semibold text-meditation-primary mt-1">{sessionStats.avgWellbeing}</p>
                  </div>
                  <Star className="h-5 w-5 text-meditation-primary opacity-70" />
                </div>
              </div>

              <div className="bg-meditation-primary/10 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-meditation-secondary">Varighed</p>
                    <p className="text-xl font-semibold text-meditation-primary mt-1">
                      {sessionStats.selectedMeditation ? Math.round(sessionStats.selectedMeditation.duration / 60) : '?'} min
                    </p>
                  </div>
                  <Clock className="h-5 w-5 text-meditation-primary opacity-70" />
                </div>
              </div>

              <div className="bg-meditation-primary/10 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-meditation-secondary">Sidst Brugt</p>
                    <p className="text-xl font-semibold text-meditation-primary mt-1">
                      {formatDate(sessionStats.lastUsed.toISOString(), { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-meditation-primary opacity-70" />
                </div>
              </div>
            </div>

            {timelineData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-meditation-primary mb-3">Feedback Historik</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#86b5a2" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#86b5a2" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tickFormatter={formatChartTick} tick={{ fill: '#667c73', fontSize: 12 }} />
                      <YAxis domain={getYAxisDomain} tick={{ fill: '#667c73', fontSize: 12 }} tickCount={Object.keys(wellbeingLabels).length} />
                      <Tooltip content={(props) => <TimelineTooltip {...props} wellbeingLabels={wellbeingLabels} />} />
                      <Area
                        type="monotone"
                        dataKey="wellbeing"
                        stroke="#86b5a2"
                        fillOpacity={1}
                        fill="url(#colorHistory)"
                        activeDot={{ r: 6, fill: '#4a7c66' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className={`grid gap-2 mt-4 grid-cols-${distributionData.length}`}>
              {distributionData.map((item) => (
                <div key={item.stringValue} className="text-center">
                  <div
                    className="mx-auto mb-1 rounded-full w-8 h-8 flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: item.color }}
                    title={`${item.label}: ${item.count} (${item.percent}%)`}
                    aria-label={`${item.label}: ${item.count} sessioner, ${item.percent}% af total`}
                  >
                    {item.count}
                  </div>
                  <div className="text-xs text-meditation-secondary">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-meditation-secondary">Vælg en meditation for at se statistik</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
