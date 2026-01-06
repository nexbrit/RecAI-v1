'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface ScoreData {
  category: string;
  score: number;
  fullMark: number;
}

interface ScoreRadarChartProps {
  data: ScoreData[];
  title?: string;
}

export function ScoreRadarChart({ data, title }: ScoreRadarChartProps) {
  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium mb-4 text-center">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
