
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for AI performance metrics
const accuracyData = [
  { date: 'Apr 1', extraction: 92, qualification: 86, sentiment: 88 },
  { date: 'Apr 2', extraction: 90, qualification: 85, sentiment: 89 },
  { date: 'Apr 3', extraction: 93, qualification: 87, sentiment: 91 },
  { date: 'Apr 4', extraction: 91, qualification: 88, sentiment: 90 },
  { date: 'Apr 5', extraction: 94, qualification: 89, sentiment: 92 },
  { date: 'Apr 6', extraction: 92, qualification: 86, sentiment: 89 },
  { date: 'Apr 7', extraction: 95, qualification: 90, sentiment: 93 },
];

const responseTimeData = [
  { date: 'Apr 1', time: 0.8 },
  { date: 'Apr 2', time: 0.9 },
  { date: 'Apr 3', time: 0.7 },
  { date: 'Apr 4', time: 0.8 },
  { date: 'Apr 5', time: 0.6 },
  { date: 'Apr 6', time: 0.7 },
  { date: 'Apr 7', time: 0.5 },
];

export const AiPerformanceMetrics = () => {
  const chartConfig: ChartConfig = {
    extraction: {
      label: "Information Extraction",
      theme: {
        light: "#0088FE",
        dark: "#0088FE",
      },
    },
    qualification: {
      label: "Lead Qualification",
      theme: {
        light: "#00C49F",
        dark: "#00C49F",
      },
    },
    sentiment: {
      label: "Sentiment Analysis",
      theme: {
        light: "#FFBB28",
        dark: "#FFBB28",
      },
    },
    time: {
      label: "Response Time (sec)",
      theme: {
        light: "#FF8042",
        dark: "#FF8042",
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Model Accuracy</CardTitle>
            <CardDescription>Performance across different tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Information Extraction</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Lead Qualification</span>
                  <span className="text-sm font-medium">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Sentiment Analysis</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Intent Recognition</span>
                  <span className="text-sm font-medium">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
            <CardDescription>Response time and reliability metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <span className="text-sm font-medium">0.7 seconds</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-medium">99.8%</span>
                </div>
                <Progress value={99.8} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className="text-sm font-medium">0.2%</span>
                </div>
                <Progress value={0.2} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">99.5%</span>
                </div>
                <Progress value={99.5} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Trends</CardTitle>
            <CardDescription>AI model accuracy over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} domain={[80, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="extraction" stroke="var(--color-extraction)" strokeWidth={2} />
                  <Line type="monotone" dataKey="qualification" stroke="var(--color-qualification)" strokeWidth={2} />
                  <Line type="monotone" dataKey="sentiment" stroke="var(--color-sentiment)" strokeWidth={2} />
                </LineChart>
                <ChartLegend content={<ChartLegendContent />} />
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average processing time in seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="time" fill="var(--color-time)" barSize={30} />
                </BarChart>
                <ChartLegend content={<ChartLegendContent />} />
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
