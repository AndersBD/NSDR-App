import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface FeedbackTimelineChartProps {
  feedbackData: any[];
  wellbeingLabels: Record<string, string>;
}

export function FeedbackTimelineChart({ feedbackData, wellbeingLabels }: FeedbackTimelineChartProps) {
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
        average: group.count > 0 ? parseFloat((group.total / group.count).toFixed(2)) : 0,
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
    // Find min and max values in the data
    let minValue = Math.min(...chartData.map((d) => d.average));
    let maxValue = Math.max(...chartData.map((d) => d.average));

    // Ensure min is at least -2 (lowest wellbeing value)
    minValue = Math.min(minValue, -2);
    // Ensure max is at least 2 (highest wellbeing value)
    maxValue = Math.max(maxValue, 2);

    return [minValue, maxValue];
  };

  // Helper function to get the nearest wellbeing label for a value
  const getWellbeingLabel = (value: number): string => {
    // Find the closest wellbeing value
    const wellbeingValues = Object.keys(wellbeingLabels).map(Number);
    const closestValue = wellbeingValues.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));

    return wellbeingLabels[closestValue] || `Value ${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const wellbeingText = getWellbeingLabel(value);

      return (
        <div className="bg-white p-3 border border-meditation-primary/20 rounded-md shadow">
          <p className="font-medium text-sm text-meditation-primary">{formatDate(label)}</p>
          <p className="text-meditation-secondary text-sm">
            Gennemsnit: <span className="font-medium">{value}</span>
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
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWellbeing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#86b5a2" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#86b5a2" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#667c73', fontSize: 12 }} />
          <YAxis domain={getYDomain()} tick={{ fill: '#667c73', fontSize: 12 }} tickCount={5} tickFormatter={(value) => value.toString()} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="average" stroke="#86b5a2" fillOpacity={1} fill="url(#colorWellbeing)" activeDot={{ r: 6, fill: '#4a7c66' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
