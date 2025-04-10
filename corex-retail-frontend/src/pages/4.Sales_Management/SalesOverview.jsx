import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesHeader } from "../../components/SalesHeader";
import { SalesOverviewChart } from "@/components/charts/SalesOverviewChart";
import { ProductSalesDistribution } from "@/components/charts/productSalesDistribution";
import { SalesTargetProgress } from "@/components/charts/SalesTargetProgress";
import { SalesForecastChart } from "@/components/charts/SalesForecastChart";

function SalesOverview() {
  return (
    <div className="flex flex-col">
      <SalesHeader
        title="Sales Overview"
        description="Comprehensive view of your sales performance"
      />

      <div className="p-4 md:p-6 space-y-6">
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Historical Sales</CardTitle>
                  <CardDescription>
                    Monthly sales data for the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesOverviewChart />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Sales vs Targets</CardTitle>
                  <CardDescription>
                    Comparison of actual sales against targets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesTargetProgress />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Sales Distribution</CardTitle>
                <CardDescription>
                  Breakdown of sales by product category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductSalesDistribution />
              </CardContent>
            </Card>
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
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
                <CardDescription>
                  Compare sales performance with previous years
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                Year-over-year comparison chart will appear here
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SalesOverview;
