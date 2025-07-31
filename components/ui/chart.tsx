"use client"

import { ChartContainer } from "@/components/ui/chart"

import type * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts"

import {
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { ChartContainer as RechartsChartContainer } from "@tremor/react"

// Define types for common chart props
interface BaseChartProps {
  data: Record<string, any>[]
  config: ChartConfig
  className?: string
}

interface LineChartProps extends BaseChartProps {
  lines: {
    dataKey: string
    stroke: string
    type?: "basis" | "linear" | "natural" | "monotone" | "step" | "stepBefore" | "stepAfter"
    strokeWidth?: number
    dot?: boolean
  }[]
  xAxisDataKey: string
}

interface BarChartProps extends BaseChartProps {
  bars: {
    dataKey: string
    fill: string
    stackId?: string
  }[]
  xAxisDataKey: string
}

interface PieChartProps extends BaseChartProps {
  pieDataKey: string
  nameKey: string
  outerRadius?: number
  innerRadius?: number
  fill?: string
  label?: boolean
}

interface RadialBarChartProps extends BaseChartProps {
  radialBars: {
    dataKey: string
    fill: string
    background?: boolean
    cornerRadius?: number
  }[]
  angleAxisDataKey: string
  valueAxisDataKey: string
}

interface AreaChartProps extends BaseChartProps {
  areas: {
    dataKey: string
    fill: string
    stroke: string
    type?: "basis" | "linear" | "natural" | "monotone" | "step" | "stepBefore" | "stepAfter"
    strokeWidth?: number
  }[]
  xAxisDataKey: string
}

// Line Chart Component
const CustomLineChart: React.FC<LineChartProps> = ({ data, config, lines, xAxisDataKey, className }) => (
  <RechartsChartContainer config={config} className={cn("min-h-[200px] w-full", className)}>
    <LineChart data={data}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey={xAxisDataKey} tickLine={false} axisLine={false} tickMargin={8} />
      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {lines.map((line, index) => (
        <Line
          key={index}
          dataKey={line.dataKey}
          type={line.type || "monotone"}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth || 2}
          dot={line.dot !== false}
        />
      ))}
    </LineChart>
  </RechartsChartContainer>
)

// Bar Chart Component
const CustomBarChart: React.FC<BarChartProps> = ({ data, config, bars, xAxisDataKey, className }) => (
  <RechartsChartContainer config={config} className={cn("min-h-[200px] w-full", className)}>
    <BarChart data={data}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey={xAxisDataKey} tickLine={false} axisLine={false} tickMargin={8} />
      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {bars.map((bar, index) => (
        <Bar key={index} dataKey={bar.dataKey} fill={bar.fill} stackId={bar.stackId} />
      ))}
    </BarChart>
  </RechartsChartContainer>
)

// Pie Chart Component
const CustomPieChart: React.FC<PieChartProps> = ({
  data,
  config,
  pieDataKey,
  nameKey,
  outerRadius = 80,
  innerRadius = 0,
  fill,
  label,
  className,
}) => (
  <RechartsChartContainer config={config} className={cn("min-h-[200px] w-full", className)}>
    <PieChart>
      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
      <Pie
        data={data}
        dataKey={pieDataKey}
        nameKey={nameKey}
        outerRadius={outerRadius}
        innerRadius={innerRadius}
        fill={fill || "var(--color-primary)"}
        label={label}
      />
      <ChartLegend content={<ChartLegendContent />} />
    </PieChart>
  </RechartsChartContainer>
)

// Radial Bar Chart Component
const CustomRadialBarChart: React.FC<RadialBarChartProps> = ({
  data,
  config,
  radialBars,
  angleAxisDataKey,
  valueAxisDataKey,
  className,
}) => (
  <RechartsChartContainer config={config} className={cn("min-h-[200px] w-full", className)}>
    <RadialBarChart innerRadius="10%" outerRadius="80%" data={data} startAngle={90} endAngle={-270}>
      <RadialBar
        minAngle={15}
        label={{ position: "insideStart", fill: "#fff" }}
        background
        dataKey={radialBars[0]?.dataKey} // Assuming single radial bar for simplicity
      />
      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
      <Tooltip />
    </RadialBarChart>
  </RechartsChartContainer>
)

// Area Chart Component
const CustomAreaChart: React.FC<AreaChartProps> = ({ data, config, areas, xAxisDataKey, className }) => (
  <RechartsChartContainer config={config} className={cn("min-h-[200px] w-full", className)}>
    <AreaChart data={data}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey={xAxisDataKey} tickLine={false} axisLine={false} tickMargin={8} />
      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      {areas.map((area, index) => (
        <Area
          key={index}
          type={area.type || "monotone"}
          dataKey={area.dataKey}
          stroke={area.stroke}
          fill={area.fill}
          strokeWidth={area.strokeWidth || 2}
        />
      ))}
    </AreaChart>
  </RechartsChartContainer>
)

export {
  CustomLineChart as LineChart,
  CustomBarChart as BarChart,
  CustomPieChart as PieChart,
  CustomRadialBarChart as RadialBarChart,
  CustomAreaChart as AreaChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
