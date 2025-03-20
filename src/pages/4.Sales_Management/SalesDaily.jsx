import React from "react";
import { SalesDailyTable } from "@/components/SalesDailyTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SalesHeader } from "../../components/SalesHeader";

function SalesDaily() {
  return (
    <div className="flex flex-col">
      <SalesHeader title="Daily Sales" description="View and manage your daily sales records" />

      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Sales Records</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Record
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£12,234</div>
              <p className="text-xs text-muted-foreground">+15% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Units Sold Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Region Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">West</div>
              <p className="text-xs text-muted-foreground">£4,320 in sales</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Records</CardTitle>
            <CardDescription>View, filter, and manage all your sales records</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesDailyTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SalesDaily;