import { useEffect, useState } from "react";
import { useSales } from "../../configs/SalesContext";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";


export function SalesOverviewChart() {
  const {
    loadSalesByDate,
    salesByDate,
    loadSalesTargetsByRange,
    salesTargetsByRange,
    loading,
    error,
  } = useSales();

  const [chartData, setChartData] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataProcessingStarted, setDataProcessingStarted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLocalLoading(true);
        const endDate = "2025-04-01";
        const startDate = "2024-04-01";
        await Promise.all([
          loadSalesByDate({ startDate, endDate }),
          loadSalesTargetsByRange({ startDate, endDate }),
        ]);
        setDataProcessingStarted(true);
      } catch (err) {
        setLocalError(err.message || "Failed to load data");
        setLocalLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (
      dataProcessingStarted &&
      Array.isArray(salesByDate) &&
      salesTargetsByRange?.allTargets
    ) {
      try {
        const targets = {};
        salesTargetsByRange.allTargets.forEach((target) => {
          if (target.targetType === "monthly") {
            const [year, month] = target.period.split("-");
            const yearMonth = `${year}-${month.padStart(2, "0")}`;
            targets[yearMonth] = target.amount;
          }
        });

        const monthlySales = {};
        salesByDate.forEach((day) => {
          const yearMonth = day.date.substring(0, 7);
          const monthName = getMonthName(yearMonth);
          if (!monthlySales[yearMonth]) {
            monthlySales[yearMonth] = {
              name: monthName,
              yearMonth,
              sales: 0,
              target: targets[yearMonth] || 0,
            };
          }
          monthlySales[yearMonth].sales += day.totalAmount || 0;
        });

        const chartArray = Object.values(monthlySales).sort((a, b) =>
          a.yearMonth.localeCompare(b.yearMonth)
        );

        setChartData(chartArray);
        setDataLoaded(true);
        setLocalLoading(false);
      } catch (err) {
        setLocalError("Error processing data: " + err.message);
        setLocalLoading(false);
      }
    }
  }, [salesByDate, salesTargetsByRange, dataProcessingStarted]);

  const getMonthName = (yearMonth) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthIndex = parseInt(yearMonth.split("-")[1]) - 1;
    return months[monthIndex] || "Unknown";
  };

  const isLoading = localLoading || loading;
  const displayError = localError || error;

  if (isLoading && !dataLoaded) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading chart...</span>
      </div>
    );
  }

  if (displayError && !dataLoaded) {
    return (
      <div className="h-[300px] flex items-center justify-center text-red-500">
        Failed to load chart: {displayError}
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

  // Rechart rendering (your original logic)
  const hasTargets = chartData.some((item) => item?.target > 0);
  const maxSales = Math.max(...chartData.map((i) => i.sales || 0));
  const maxTarget = Math.max(...chartData.map((i) => i.target || 0));
  const maxValue = Math.max(maxSales, maxTarget);
  const yAxisMax =
    maxValue > 1_000_000 ? Math.ceil(maxValue / 1_000_000) * 1_000_000 :
    maxValue > 100_000 ? Math.ceil(maxValue / 100_000) * 100_000 :
    Math.ceil(maxValue / 10_000) * 10_000;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, yAxisMax]} />
          <Tooltip formatter={(v) => [`£${v.toLocaleString()}`, undefined]} labelFormatter={(l) => `Month: ${l}`} />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Actual Sales" strokeWidth={2} />
          {hasTargets && (
            <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target Sales" strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
