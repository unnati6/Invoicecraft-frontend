"use client";

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartContainer, // ChartConfig and ChartTooltip are destructured in the original, but the types are removed.
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from './ui/chart';

// Removed export interface ChartData
// Removed interface DashboardChartProps

const chartConfig = {
  value: {
    label: 'Amount',
  },
  sales: {
    label: 'Total Sales',
    color: 'hsl(var(--chart-1))',
  },
  received: {
    label: 'Payments Received',
    color: 'hsl(var(--chart-2))',
  },
  pending: {
    label: 'Payments Pending',
    color: 'hsl(var(--chart-3))',
  },
}; // Removed satisfies ChartConfig;

export function DashboardChart({ data, currencySymbol = '$' }) { // Removed DashboardChartProps type
  if (!data || data.length === 0) {
    return React.createElement("div", { className: "flex items-center justify-center h-full text-muted-foreground" }, "No data available for chart.");
  }

  // Map data to include specific keys for chartConfig if needed, or use a generic key like 'value'
  // For this setup, `data` is expected to be like [{ name: "Total Sales", value: 1000, fill: "hsl(...)"}, ...]

  return (
    React.createElement(ChartContainer, { config: chartConfig, className: "min-h-[200px] w-full h-full" },
      React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
        React.createElement(BarChart, {
          accessibilityLayer: true,
          data: data,
          layout: "vertical", // Make it a vertical bar chart (categories on Y, values on X)
          margin: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          }
        },
          React.createElement(CartesianGrid, { horizontal: false, vertical: true, strokeDasharray: "3 3" }),
          React.createElement(YAxis, {
            dataKey: "name",
            type: "category",
            tickLine: false,
            tickMargin: 10,
            axisLine: false,
            tickFormatter: (value) => value, // Display full name
            className: "text-xs"
          }),
          React.createElement(XAxis, {
            dataKey: "value",
            type: "number",
            axisLine: false,
            tickLine: false,
            tickFormatter: (value) => `${currencySymbol}${value.toLocaleString()}`,
            className: "text-xs"
          }),
          React.createElement(ChartTooltip, {
            cursor: false,
            content: React.createElement(ChartTooltipContent, {
              indicator: "dot",
              labelKey: 'name',
              formatter: (value, name, item) => (
                React.createElement("div", { className: "flex flex-col" },
                  React.createElement("span", { className: "font-medium" }, item.payload.name),
                  React.createElement("span", { className: "text-muted-foreground" }, currencySymbol, Number(value).toFixed(2))
                )
              )
            })
          }),
          React.createElement(ChartLegend, { content: React.createElement(ChartLegendContent, null) }),
          React.createElement(Bar, { dataKey: "value", layout: "vertical", radius: 4 })
        )
      )
    )
  );
}

DashboardChart.displayName = 'DashboardChart';