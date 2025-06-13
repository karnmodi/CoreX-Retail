import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SalesOverviewChart } from "@/components/charts/SalesOverviewChart";
import { SalesTargetProgress } from "@/components/charts/SalesTargetProgress";
import { RecentSales } from "@/components/charts/RecentSales";
import { TopProducts } from "@/components/charts/TopProducts";
import { DailySalesChart } from "@/components/charts/DailySalesChart";
import { SalesForecastChart } from "@/components/charts/SalesForecastChart";
import { SalesHeader } from "../../components/SalesHeader";
import { useSales } from "../../configs/SalesContext";
import { Loader2, TrendingUp, TrendingDown, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

function SalesDashboard() {
  const {
    dashboardData,
    loading,
    error,
    refreshDashboard,
    salesByDate,
    salesByDateDaily,
  } = useSales();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    refreshDashboard();
  }, []);

  useEffect(() => {
    if (dashboardData) {
      if (dashboardData.last30Days && dashboardData.last30Days.dailySales) {
        const monthlyData = dashboardData.last30Days.dailySales.map((day) => ({
          name: day.date.substring(5),
          sales: day.totalAmount,
          target: 0,
        }));
        setChartData(monthlyData);
      }
    }
  }, [dashboardData]);

  if (loading.dashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <SalesHeader
          title="Sales Dashboard"
          description="Overview of your sales performance"
        />
        <div className="p-4 md:p-6">
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const calculateSalesStats = () => {
    const dataSource =
      salesByDateDaily && salesByDateDaily.length > 0
        ? salesByDateDaily
        : dashboardData?.last30Days?.dailySales || [];

    if (!dataSource || dataSource.length === 0) {
      return {
        average: 0,
        highest: { amount: 0, date: "" },
        lowest: { amount: 0, date: "" },
      };
    }


    const total = dataSource.reduce(
      (sum, day) => sum + (day.totalAmount || 0),
      0
    );
    const average = total / dataSource.length;

    let highest = { amount: 0, date: "" };
    let lowest = { amount: Infinity, date: "" };

    dataSource.forEach((day) => {
      const amount = day.totalAmount || 0;

      if (amount > highest.amount) {
        highest = { amount, date: day.date };
      }

      if (amount > 0 && amount < lowest.amount) {
        lowest = { amount, date: day.date };
      }
    });

    if (lowest.amount === Infinity) {
      lowest = { amount: 0, date: "" };
    }

    const stats = { average, highest, lowest };
    return stats;
  };

  const salesStats = calculateSalesStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
    } catch (e) {
      return dateString;
    }
  };

  const todayPrediction = dashboardData?.today?.prediction;
  const yesterdayPrediction = dashboardData?.yesterday?.prediction;

  return (
    <div className="flex flex-col">
      <SalesHeader
        title="Sales Dashboard"
        description="Overview of your sales performance"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.last30Days?.totalAmount
                ? formatCurrency(dashboardData.last30Days.totalAmount)
                : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.today?.percentChange
                ? `${
                    dashboardData.today.percentChange > 0 ? "+" : ""
                  }${dashboardData.today.percentChange.toFixed(
                    1
                  )}% from Last Month`
                : "No change data available"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.last30Days?.totalTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Transactions in last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.today?.totalAmount
                ? formatCurrency(dashboardData.today.totalAmount)
                : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.today?.transactionCount || 0} transactions today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.topProducts &&
              dashboardData.topProducts.length > 0
                ? dashboardData.topProducts[0].productName
                : "Iphone 16 Pro"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.topProducts &&
              dashboardData.topProducts.length > 0
                ? formatCurrency(dashboardData.topProducts[0].totalAmount)
                : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Summary Cards */}
      {todayPrediction && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4 md:px-6 md:pt-0 md:pb-4">
          <Card className="border border-blue-100 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Today's Prediction
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                Forecast
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(todayPrediction.predictedEndOfDay)}
              </div>
              <p className="text-xs text-blue-600">
                Current progress: {formatCurrency(todayPrediction.currentSales)}
                (
                {todayPrediction.predictedEndOfDay > 0
                  ? `${Math.min(
                      100,
                      (
                        (todayPrediction.currentSales /
                          todayPrediction.predictedEndOfDay) *
                        100
                      ).toFixed(1)
                    )}%`
                  : "0%"}
                )
              </p>
            </CardContent>
          </Card>

          {dashboardData?.today?.percentChange !== undefined && (
            <Card
              className={
                dashboardData.today.percentChange >= 0
                  ? "border border-green-100 bg-green-50"
                  : "border border-red-100 bg-red-50"
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  vs Yesterday
                </CardTitle>
                {dashboardData.today.percentChange >= 0 ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {dashboardData.today.percentChange.toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {Math.abs(dashboardData.today.percentChange).toFixed(1)}%
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-slate-500">Today</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(dashboardData.today.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Yesterday</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(dashboardData.yesterday.totalAmount)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {yesterdayPrediction &&
            yesterdayPrediction.accuracy !== undefined && (
              <Card className="border border-purple-100 bg-purple-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">
                    Prediction Accuracy (Yesterday)
                  </CardTitle>
                  <Badge
                    className={
                      yesterdayPrediction.accuracy >= 90
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : yesterdayPrediction.accuracy >= 70
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                  >
                    <Target className="h-3 w-3 mr-1" />
                    {yesterdayPrediction.accuracy.toFixed(1)}%
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-purple-600">Predicted</div>
                      <div className="text-lg font-bold text-purple-700">
                        {formatCurrency(yesterdayPrediction.predictedSales)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-purple-600">Actual</div>
                      <div className="text-lg font-bold text-purple-700">
                        {formatCurrency(yesterdayPrediction.actualSales)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      <Tabs defaultValue="overview" className="p-4 md:p-6 space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Sales</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Monthly sales performance for the last 12 months.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesOverviewChart
                  data={dashboardData?.last30Days?.dailySales || []}
                />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Latest transactions from all locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales data={dashboardData?.recentSales || []} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Target Progress</CardTitle>
                <CardDescription>
                  Current progress towards targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesTargetProgress />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Best performing products this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopProducts data={dashboardData?.topProducts || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Performance</CardTitle>
              <CardDescription>
                Detailed view of sales for the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DailySalesChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Daily Average</CardTitle>
                <CardDescription>Average daily sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(salesStats.average)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on{" "}
                  {salesByDateDaily?.length ||
                    dashboardData?.last30Days?.dailySales?.length ||
                    0}{" "}
                  days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Highest Day</CardTitle>
                <CardDescription>Highest daily sales in period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(salesStats.highest.amount)}
                </div>
                {salesStats.highest.date && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(salesStats.highest.date)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lowest Day</CardTitle>
                <CardDescription>Lowest daily sales in period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(salesStats.lowest.amount)}
                </div>
                {salesStats.lowest.date && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(salesStats.lowest.date)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Forecast</CardTitle>
              <CardDescription>
                Predicted sales trends based on historical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesForecastChart />
            </CardContent>
          </Card>

          {todayPrediction && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Prediction Details</CardTitle>
                <CardDescription>
                  Detailed breakdown of today's sales prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-slate-50 p-4 rounded-md">
                    <div className="text-sm font-medium text-slate-500 mb-1">
                      Current Sales
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(todayPrediction.currentSales)}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-md">
                    <div className="text-sm font-medium text-slate-500 mb-1">
                      Predicted End of Day
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(todayPrediction.predictedEndOfDay)}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-md">
                    <div className="text-sm font-medium text-slate-500 mb-1">
                      Completion
                    </div>
                    <div className="text-2xl font-bold">
                      {todayPrediction.predictedEndOfDay > 0
                        ? `${Math.min(
                            100,
                            (
                              (todayPrediction.currentSales /
                                todayPrediction.predictedEndOfDay) *
                              100
                            ).toFixed(1)
                          )}%`
                        : "0%"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-slate-500 border-t pt-4">
                Predictions are generated using machine learning based on
                historical sales patterns.
              </CardFooter>
            </Card>
          )}

          {dashboardData?.last30Days?.dailySales &&
            dashboardData.last30Days.dailySales.some(
              (day) => day.prediction?.accuracy
            ) && (
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Accuracy History</CardTitle>
                  <CardDescription>
                    Historical accuracy of our sales predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PredictionAccuracyChart
                      data={dashboardData.last30Days.dailySales.filter(
                        (day) => day.prediction?.accuracy
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PredictionAccuracyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No prediction accuracy data available
      </div>
    );
  }

  const chartData = data.map((day) => ({
    date: day.date.substring(5),
    accuracy: day.prediction.accuracy || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip
          formatter={(value) => [`${value.toFixed(2)}%`, "Accuracy"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <ReferenceLine
          y={90}
          stroke="green"
          strokeDasharray="3 3"
          label={{
            value: "Excellent",
            position: "insideBottomRight",
            fill: "green",
            fontSize: 12,
          }}
        />
        <ReferenceLine
          y={70}
          stroke="orange"
          strokeDasharray="3 3"
          label={{
            value: "Good",
            position: "insideBottomRight",
            fill: "orange",
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="accuracy"
          name="Prediction Accuracy"
          fill="#8884d8"
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default SalesDashboard;
