import { useEffect, useState, useRef } from "react";
import { useSales } from "../../configs/SalesContext";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export function SalesOverviewChart() {
  const {
    loadSalesByDateMonthly,
    salesByDateMonthly,
    loadSalesTargetsByRange,
    salesTargetsByRange,
    loading,
    error,
  } = useSales();

  const [chartData, setChartData] = useState([]);
  const dataFetched = useRef(false);

  // Single effect to handle data fetching and processing
  useEffect(() => {
    const fetchData = async () => {
      if (dataFetched.current) return;
      dataFetched.current = true;

      try {
        // Using a full year range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);

        const formattedEndDate = endDate.toISOString().split("T")[0];
        const formattedStartDate = startDate.toISOString().split("T")[0];

        console.log(
          `[SalesOverviewChart] Fetching data from ${formattedStartDate} to ${formattedEndDate}`
        );

        // Fetch data in parallel with a single Promise.all
        await Promise.all([
          loadSalesByDateMonthly({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          }),
          loadSalesTargetsByRange({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          }),
        ]);
      } catch (err) {
        console.error("[SalesOverviewChart] Error loading data:", err);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Process the data when it's available
  useEffect(() => {
    if (!salesByDateMonthly || !salesTargetsByRange) return;

    try {
      console.log(
        `[SalesOverviewChart] Processing ${
          salesByDateMonthly?.length || 0
        } months of data`
      );

      // Create targets map by month from summary object
      const targets = {};

      if (salesTargetsByRange.summary) {
        Object.entries(salesTargetsByRange.summary).forEach(([key, value]) => {
          if (key.startsWith("monthly-")) {
            // Extract the YYYY-MM part from "monthly-YYYY-MM"
            const monthKey = key.substring(8);
            targets[monthKey] = value.target;
          }
        });
      }

      console.log("[SalesOverviewChart] Monthly targets:", targets);

      // Map the monthly data to chart data
      const chartArray = salesByDateMonthly.map((monthData) => {
        const monthKey = monthData.month;
        return {
          name: monthData.displayName,
          month: monthKey,
          sales: monthData.totalAmount || 0,
          target: targets[monthKey] || 0,
        };
      });

      setChartData(chartArray);
    } catch (err) {
      console.error("[SalesOverviewChart] Error processing data:", err);
    }
  }, [salesByDateMonthly, salesTargetsByRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold">
            {format(new Date(`${label}-01`), "MMMM yyyy")}
          </p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: £
              {entry.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Simplified loading check
  const isLoading = loading.salesByDateMonthly || loading.salesTargetsByRange;

  if (isLoading && chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading chart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center text-red-500">
        Failed to load chart: {error}
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data to display.
      </div>
    );
  }

  // Chart rendering with optimized max value calculation
  const hasTargets = chartData.some((item) => item?.target > 0);

  // Calculate max values in one pass
  const maxValue = chartData.reduce((max, item) => {
    return Math.max(max, item.sales || 0, item.target || 0);
  }, 0);

  const yAxisMax =
    maxValue > 1_000_000
      ? Math.ceil(maxValue / 1_000_000) * 1_000_000
      : maxValue > 100_000
      ? Math.ceil(maxValue / 100_000) * 100_000
      : Math.ceil(maxValue / 10_000) * 10_000;

  // More efficient tooltip formatter
  const formatCurrency = (value) => `£${value.toLocaleString()}`;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            domain={[0, yAxisMax]}
            tickFormatter={(value) =>
              value >= 1000000
                ? `£${(value / 1000000).toFixed(1)}M`
                : value >= 1000
                ? `£${(value / 1000).toFixed(0)}k`
                : `£${value}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#8884d8"
            name="Actual Sales"
            strokeWidth={2}
            connectNulls
          />
          {hasTargets && (
            <Line
              type="monotone"
              dataKey="target"
              stroke="#82ca9d"
              name="Target Sales"
              strokeWidth={2}
              strokeDasharray="5 5"
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
