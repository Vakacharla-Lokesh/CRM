import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  type ChartRendererProps,
  CHART_COLORS,
} from "@/types/constants/analytics/analyticsChartTypes";

function NumberCard({ value, metric }: { value: number; metric: string }) {
  const formatted =
    metric === "sum" && value >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : metric === "avg"
        ? value.toFixed(2)
        : value.toLocaleString();

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <span
        className="text-5xl font-bold tracking-tight"
        style={{ color: "var(--primary)" }}
      >
        {formatted}
      </span>
      <span
        className="text-sm mt-2"
        style={{ color: "var(--muted-foreground)" }}
      >
        {metric === "count"
          ? "total records"
          : metric === "sum"
            ? "total value"
            : "average"}
      </span>
    </div>
  );
}

function ChartRenderer({ type, data, metric }: ChartRendererProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        No data available
      </div>
    );
  }

  // For "number" type, show the total/single value
  if (type === "number") {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return (
      <NumberCard
        value={total}
        metric={metric}
      />
    );
  }

  // For "table" type, render a simple data table
  if (type === "table") {
    return (
      <div className="overflow-auto h-full">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th
                className="text-left py-2 px-3 font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                Label
              </th>
              <th
                className="text-right py-2 px-3 font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <td
                  className="py-2 px-3"
                  style={{ color: "var(--foreground)" }}
                >
                  {row.label}
                </td>
                <td
                  className="py-2 px-3 text-right font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  {typeof row.value === "number"
                    ? row.value.toLocaleString()
                    : row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const tickStyle = { fill: "var(--muted-foreground)", fontSize: 11 };

  if (type === "bar") {
    return (
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{ top: 6, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
          />
          <Bar
            dataKey="value"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={data}
          margin={{ top: 6, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--primary)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={data}
          margin={{ top: 6, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="analyticsAreaGrad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="var(--primary)"
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor="var(--primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#analyticsAreaGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === "pie") {
    return (
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
            formatter={(value: number, name: string) => [
              value.toLocaleString(),
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

export default ChartRenderer;
