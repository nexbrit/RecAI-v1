'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FunnelData {
  stage: string;
  count: number;
}

interface ConversionFunnelChartProps {
  data: FunnelData[];
}

const STAGE_COLORS = [
  'hsl(var(--stage-new))',
  'hsl(var(--stage-review))',
  'hsl(var(--stage-pass))',
  'hsl(var(--stage-interview))',
  'hsl(var(--stage-offer))',
];

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Conversion</CardTitle>
        <CardDescription>Candidate flow through pipeline stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis
              dataKey="stage"
              type="category"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
