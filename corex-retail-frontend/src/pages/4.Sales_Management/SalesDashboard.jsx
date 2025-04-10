import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesOverviewChart } from "@/components/charts/SalesOverviewChart";
import { SalesTargetProgress } from "@/components/charts/SalesTargetProgress";
import { RecentSales } from "@/components/charts/RecentSales";
import { TopProducts } from "@/components/charts/TopProducts";
import { SalesHeader } from "../../components/SalesHeader";
import { useSales } from "../../configs/SalesContext";
import { Loader2 } from "lucide-react";

function SalesDashboard() {
  const { dashboardData, loading, error, refreshDashboard } = useSales();
  const [chartData, setChartData] = useState([]);
  const [targetsData, setTargetsData] = useState([]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    if (dashboardData) {
      if (dashboardData.last30Days && dashboardData.last30Days.dailySales) {
        const monthlyData = dashboardData.last30Days.dailySales.map(day => ({
          name: day.date.substring(5), 
          sales: day.totalAmount,
          target: 0 
        }));
        setChartData(monthlyData);
      }

    }
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>Error loading dashboard data: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <SalesHeader title="Sales Dashboard" description="Overview of your sales performance" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.last30Days?.totalAmount 
                ? `£${dashboardData.last30Days.totalAmount.toFixed(2)}` 
                : "£0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.today?.percentChange 
                ? `${dashboardData.today.percentChange > 0 ? '+' : ''}${dashboardData.today.percentChange.toFixed(1)}% from yesterday` 
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
            <p className="text-xs text-muted-foreground">Transactions in last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{dashboardData?.today?.totalAmount ? dashboardData.today.totalAmount.toFixed(2) : "0.00"}
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
              {dashboardData?.topProducts && dashboardData.topProducts.length > 0 
                ? dashboardData.topProducts[0].productName 
                : "No data"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.topProducts && dashboardData.topProducts.length > 0 
                ? `£${dashboardData.topProducts[0].totalAmount.toFixed(2)} in sales` 
                : "No sales data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="p-4 md:p-6 space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Daily sales performance for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesOverviewChart 
                  data={dashboardData?.last30Days?.dailySales || []} 
                />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Target Progress</CardTitle>
                <CardDescription>Current progress towards targets</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesTargetProgress />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Latest transactions from all locations</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales data={dashboardData?.recentSales || []} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <TopProducts data={dashboardData?.topProducts || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Detailed analysis of your sales data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Advanced analytics content will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download sales reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Reports content will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SalesDashboard;