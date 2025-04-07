
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Funnel, FunnelChart, LabelList } from "recharts";

interface PipelineAnalyticsProps {
  compact?: boolean;
}

// Sample data for pipeline analytics
const pipelineStageData = [
  { name: 'New', value: 120 },
  { name: 'Contacted', value: 85 },
  { name: 'Qualified', value: 60 },
  { name: 'Proposal', value: 40 },
  { name: 'Converted', value: 25 },
];

const stageTimeData = [
  { stage: 'New to Contacted', days: 2.3 },
  { stage: 'Contacted to Qualified', days: 4.5 },
  { stage: 'Qualified to Proposal', days: 5.2 },
  { stage: 'Proposal to Converted', days: 7.8 },
];

const conversionTrendData = [
  { date: 'Apr 1', rate: 22 },
  { date: 'Apr 2', rate: 21 },
  { date: 'Apr 3', rate: 24 },
  { date: 'Apr 4', rate: 25 },
  { date: 'Apr 5', rate: 23 },
  { date: 'Apr 6', rate: 26 },
  { date: 'Apr 7', rate: 27 },
];

export const PipelineAnalytics = ({ compact = false }: PipelineAnalyticsProps) => {
  const chartConfig: ChartConfig = {
    value: {
      label: "Leads",
      theme: {
        light: "#0088FE",
        dark: "#0088FE",
      },
    },
    days: {
      label: "Average Days",
      theme: {
        light: "#00C49F",
        dark: "#00C49F",
      },
    },
    rate: {
      label: "Conversion Rate (%)",
      theme: {
        light: "#FFBB28",
        dark: "#FFBB28",
      },
    },
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Performance</CardTitle>
          <CardDescription>Conversion through stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="value"
                  data={pipelineStageData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Funnel</CardTitle>
          <CardDescription>Lead progression through sales stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="value"
                  data={pipelineStageData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                  <LabelList position="inside" fill="#fff" stroke="none" dataKey="value" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stage Duration</CardTitle>
            <CardDescription>Average days spent in each pipeline stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={stageTimeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="days" fill="var(--color-days)" barSize={30} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Trend</CardTitle>
            <CardDescription>Percentage of total leads converting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={conversionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} />
                </LineChart>
                <ChartLegend content={<ChartLegendContent />} />
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
