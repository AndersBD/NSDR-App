'use client';

import { getFeedbackColor } from '@/lib/feedback-utils';
import { WellbeingOption } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface FeedbackDistributionChartProps {
  feedbackData: any[];
  wellbeingLabels: Record<string, string>;
  wellbeingOptions?: WellbeingOption[];
}

export function FeedbackDistributionChart({ feedbackData, wellbeingLabels, wellbeingOptions }: FeedbackDistributionChartProps) {
  // Process data for the chart - count occurrences of each wellbeing value
  const chartData = useMemo(() => {
    // Create dynamic counts object based on wellbeingLabels
    const counts: Record<string, number> = {};

    // Initialize all possible values from wellbeingLabels
    Object.keys(wellbeingLabels).forEach((value) => {
      counts[value] = 0;
    });

    feedbackData.forEach((item) => {
      const value = item.wellbeing_change.toString();
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts).map(([value, count]) => ({
      name: wellbeingLabels[value] || `Value ${value}`,
      value: count,
      wellbeingValue: Number.parseInt(value),
    }));
  }, [feedbackData, wellbeingLabels]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / feedbackData.length) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 border border-meditation-primary/20 rounded-md shadow-md">
          <p className="font-medium text-sm text-meditation-primary">{data.name}</p>
          <p className="text-meditation-secondary text-sm">
            Antal: <span className="font-medium">{data.value}</span> ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div className="w-full h-[300px] flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            animationBegin={200}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getFeedbackColor(entry.wellbeingValue, wellbeingOptions)} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {chartData.map((entry) => (
          <div key={entry.wellbeingValue} className="flex items-center text-xs bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getFeedbackColor(entry.wellbeingValue, wellbeingOptions) }} />
            <span className="text-meditation-secondary">{entry.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
