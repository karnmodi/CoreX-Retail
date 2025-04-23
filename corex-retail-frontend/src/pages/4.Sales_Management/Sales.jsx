import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
// import { SalesOverview } from "@/components/sales-overview";
// import { SalesTable } from "@/components/sales-table";
import { Download } from "lucide-react";

export default function SalesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Total Revenue",
                value: "$45,231.89",
                change: "+20.1% from last month",
              },
              {
                title: "Average Order Value",
                value: "$59.42",
                change: "+2.5% from last month",
              },
              {
                title: "Conversion Rate",
                value: "3.2%",
                change: "+0.3% from last month",
              },
              {
                title: "Total Orders",
                value: "12,234",
                change: "+19% from last month",
              },
            ].map((item, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground">{item.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* <SalesOverview /> */}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* <SalesTable /> */}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Your best performing products this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  { name: "Premium T-Shirt", amount: "$12,234.00", width: "75%" },
                  { name: "Designer Jeans", amount: "$10,880.00", width: "65%" },
                  { name: "Casual Sneakers", amount: "$9,432.00", width: "55%" },
                  { name: "Leather Jacket", amount: "$8,751.00", width: "40%" },
                  { name: "Wireless Headphones", amount: "$7,654.00", width: "35%" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center">
                      <div className="font-medium">{item.name}</div>
                      <div className="ml-auto">{item.amount}</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: item.width }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Sales Performance</CardTitle>
              <CardDescription>
                Top performing staff members by sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  { name: "Sofia Oliveira", amount: "$8,234.00", width: "85%" },
                  { name: "Lucas Garcia", amount: "$7,880.00", width: "75%" },
                  { name: "Zoe Patel", amount: "$6,432.00", width: "65%" },
                  { name: "Jackson Davis", amount: "$5,751.00", width: "55%" },
                  { name: "Olivia Johnson", amount: "$4,654.00", width: "45%" },
                ].map((staff, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center">
                      <div className="font-medium">{staff.name}</div>
                      <div className="ml-auto">{staff.amount}</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: staff.width }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
