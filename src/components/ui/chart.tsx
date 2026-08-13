'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<string, { label?: string; color?: string }>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

export function ChartContainer({
  className,
  config,
  children,
  ...props
}: React.ComponentProps<'div'> & { config: ChartConfig }) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn('w-full', className)} {...props}>
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip(props: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return (
    <RechartsPrimitive.Tooltip
      cursor={{ stroke: '#E5E5E5', strokeWidth: 1 }}
      contentStyle={{
        borderRadius: 4,
        border: '1px solid #EBEBEB',
        boxShadow: 'none',
        fontSize: 12,
        background: '#FFFFFF',
      }}
      {...props}
    />
  );
}

export const ChartLine = RechartsPrimitive.Line;
export const ChartArea = RechartsPrimitive.Area;
export const ChartXAxis = RechartsPrimitive.XAxis;
export const ChartYAxis = RechartsPrimitive.YAxis;
export const ChartCartesianGrid = RechartsPrimitive.CartesianGrid;
export const ChartLineChart = RechartsPrimitive.LineChart;
export const ChartAreaChart = RechartsPrimitive.AreaChart;
