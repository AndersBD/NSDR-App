'use client';

import { getNearestFeedbackLabel } from '@/lib/feedback-utils';
import { WellbeingOption } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface FeedbackTimelineChartProps {
  feedbackData: any[];
  wellbeingLabels: Record<string, string>;
  wellbeingOptions?: WellbeingOption[];
}

export function FeedbackTimelineChart({ feedbackData, wellbeingLabels, wellbeingOptions }: FeedbackTimelineChartProps) {
  // Process data for the chart - group by date and calculate average wellbeing change
  const chartData = useMemo(() => {
    const dateGroups: Record<string, { date: string; count: number; total: number }> = {};

    feedbackData.forEach((item) => {
      const date = new Date(item.created_at);
      const dateKey = date.toISOString().split('T')[0];

      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { date: dateKey, count: 0, total: 0 };
      }

      dateGroups[dateKey].count += 1;
      dateGroups[dateKey].total += item.wellbeing_change;
    });

    return Object.values(dateGroups)
      .map((group) => ({
        date: group.date,
        average: group.count > 0 ? Number.parseFloat((group.total / group.count).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [feedbackData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('da-DK', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getYDomain = () => {
    if (wellbeingOptions && wellbeingOptions.length > 0) {
      // Use the range from the available options
      const values = wellbeingOptions.map((option) => option.value);
      return [Math.min(...values), Math.max(...values)];
    }

    // Find min and max values in the data
    let minValue = Math.min(...chartData.map((d) => d.average));
    let maxValue = Math.max(...chartData.map((d) => d.average));

    // Ensure min is at least 0 (lowest wellbeing value in new scale)
    minValue = Math.min(minValue, 0);
    // Ensure max is at least 3 (highest wellbeing value in new scale)
    maxValue = Math.max(maxValue, 3);

    return [minValue, maxValue];
  };

  // Helper function to get the nearest wellbeing label for a value
  const getWellbeingLabel = (value: number): string => {
    return getNearestFeedbackLabel(value, wellbeingOptions || wellbeingLabels);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const wellbeingText = getWellbeingLabel(value);

      return (
        <div className="bg-white p-3 border border-meditation-primary/20 rounded-md shadow-md">
          <p className="font-medium text-sm text-meditation-primary">{formatDate(label)}</p>
          <p className="text-meditation-secondary text-sm">
            Score: <span className="font-medium">{value}</span>
          </p>
          <p className="text-meditation-secondary text-sm">
            Vurdering: <span className="font-medium">{wellbeingText}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div className="w-full h-[300px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWellbeing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a7c66" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#86b5a2" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#667c73', fontSize: 12 }} tickMargin={10} />
          <YAxis domain={getYDomain()} tick={{ fill: '#667c73', fontSize: 12 }} tickCount={5} tickFormatter={(value) => value.toString()} tickMargin={10} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="average"
            stroke="#4a7c66"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorWellbeing)"
            activeDot={{ r: 6, fill: '#4a7c66', stroke: 'white', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
