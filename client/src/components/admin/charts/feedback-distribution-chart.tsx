'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface FeedbackDistributionChartProps {
  feedbackData: any[];
  wellbeingLabels: Record<string, string>;
}

export function FeedbackDistributionChart({ feedbackData, wellbeingLabels }: FeedbackDistributionChartProps) {
  // Process data for the chart - count occurrences of each wellbeing value
  const chartData = useMemo(() => {
    const counts: Record<number, number> = { '-2': 0, '-1': 0, '0': 0, '1': 0, '2': 0 };

    feedbackData.forEach((item) => {
      const value = item.wellbeing_change;
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts).map(([value, count]) => ({
      name: wellbeingLabels[value] || `Value ${value}`,
      value: count,
      wellbeingValue: Number.parseInt(value),
    }));
  }, [feedbackData, wellbeingLabels]);

  // Define colors for each wellbeing value with a more calming palette
  const COLORS = {
    '-2': '#e57373', // Soft red - very negative
    '-1': '#ffb74d', // Soft orange - somewhat negative
    '0': '#90caf9', // Soft blue - neutral
    '1': '#81c784', // Soft green - somewhat positive
    '2': '#4a7c66', // Meditation primary - very positive
  };

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
              <Cell key={`cell-${index}`} fill={COLORS[entry.wellbeingValue.toString() as keyof typeof COLORS]} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {chartData.map((entry) => (
          <div key={entry.wellbeingValue} className="flex items-center text-xs bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[entry.wellbeingValue.toString() as keyof typeof COLORS] }} />
            <span className="text-meditation-secondary">{entry.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
