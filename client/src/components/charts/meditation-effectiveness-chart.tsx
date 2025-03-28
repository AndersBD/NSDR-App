'use client';

import type { StorageFile } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MeditationEffectivenessChartProps {
  feedbackData: any[];
  meditationsMap: Record<string, StorageFile | null>;
  wellbeingLabels: Record<string, string>;
}

export function MeditationEffectivenessChart({ feedbackData, meditationsMap, wellbeingLabels }: MeditationEffectivenessChartProps) {
  // Process data for the chart - calculate average wellbeing change per meditation
  const chartData = useMemo(() => {
    const meditationStats: Record<
      string,
      {
        id: string;
        name: string;
        count: number;
        total: number;
        duration: number;
      }
    > = {};

    feedbackData.forEach((item) => {
      const id = item.storage_object_id;
      const meditation = meditationsMap[id];

      if (!meditation) return;

      const name = meditation.name;

      if (!meditationStats[id]) {
        meditationStats[id] = {
          id,
          name,
          count: 0,
          total: 0,
          duration: meditation.duration / 60, // Convert to minutes
        };
      }

      meditationStats[id].count += 1;
      meditationStats[id].total += item.wellbeing_change;
    });

    return Object.values(meditationStats)
      .filter((stat) => stat.count >= 1) // Only include meditations with at least 1 feedback
      .map((stat) => ({
        id: stat.id,
        name: stat.name,
        count: stat.count,
        average: Number.parseFloat((stat.total / stat.count).toFixed(2)),
        duration: stat.duration,
      }))
      .sort((a, b) => b.average - a.average); // Sort by effectiveness
  }, [feedbackData, meditationsMap]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const wellbeingLabel = getWellbeingLabel(data.average);

      return (
        <div className="bg-white p-3 border border-meditation-primary/20 rounded-md shadow-md">
          <p className="font-medium text-sm text-meditation-primary">"{data.name}"</p>
          <p className="text-meditation-secondary text-xs mt-1">
            Gennemsnit: <span className="font-medium">{data.average}</span> ({wellbeingLabel})
          </p>
          <p className="text-meditation-secondary text-xs">
            Antal sessioner: <span className="font-medium">{data.count}</span>
          </p>
          <p className="text-meditation-secondary text-xs">
            Varighed: <span className="font-medium">{data.duration} min</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper function to get the nearest wellbeing label for a value
  const getWellbeingLabel = (value: number): string => {
    // Find the closest wellbeing value
    const wellbeingValues = Object.keys(wellbeingLabels).map(Number);
    const closestValue = wellbeingValues.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));

    return wellbeingLabels[closestValue] || `Value ${value}`;
  };

  const getBarColor = (value: number) => {
    if (value <= -1) return '#e57373';
    if (value < 0) return '#ffb74d';
    if (value === 0) return '#90caf9';
    if (value <= 1) return '#81c784';
    return '#4a7c66';
  };

  return (
    <motion.div className="w-full h-[400px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 120, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[-2, 2]} tickCount={5} tick={{ fill: '#667c73', fontSize: 12 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#667c73', fontSize: 12 }} width={120} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="average" barSize={20} animationDuration={1500} animationBegin={300}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.average)} radius={4} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
