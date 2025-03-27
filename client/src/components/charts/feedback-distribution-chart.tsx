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
      wellbeingValue: parseInt(value),
    }));
  }, [feedbackData, wellbeingLabels]);

  // Define colors for each wellbeing value
  const COLORS = {
    '-2': '#e57373', // Red - very negative
    '-1': '#ffb74d', // Orange - somewhat negative
    '0': '#90caf9', // Blue - neutral
    '1': '#81c784', // Light green - somewhat positive
    '2': '#4a7c66', // Dark green - very positive
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / feedbackData.length) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 border border-meditation-primary/20 rounded-md shadow">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-meditation-secondary text-sm">
            Antal: <span className="font-medium">{data.value}</span> ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.wellbeingValue.toString() as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {chartData.map((entry) => (
          <div key={entry.wellbeingValue} className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[entry.wellbeingValue.toString() as keyof typeof COLORS] }} />
            <span className="text-meditation-secondary">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
