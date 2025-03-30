import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, DollarSign, Package, Settings, ShoppingBag, Users } from "lucide-react";

function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "inventory",
      title: "Low Stock Alert",
      message: "5 products are below the reorder threshold",
      time: "10 minutes ago",
      read: false,
      icon: Package,
    },
    {
      id: 2,
      type: "staff",
      title: "New Time Off Request",
      message: "Michael Brown has requested time off",
      time: "1 hour ago",
      read: false,
      icon: Calendar,
    },
    {
      id: 3,
      type: "sales",
      title: "Sales Milestone Reached",
      message: "Monthly sales target has been exceeded by 15%",
      time: "3 hours ago",
      read: true,
      icon: DollarSign,
    },
    {
      id: 4,
      type: "system",
      title: "System Update",
      message: "The system will undergo maintenance in 2 days",
      time: "5 hours ago",
      read: true,
      icon: Settings,
    },
    {
      id: 5,
      type: "inventory",
      title: "New Inventory Received",
      message: "25 new items have been added to inventory",
      time: "Yesterday",
      read: true,
      icon: Package,
    },
    {
      id: 6,
      type: "staff",
      title: "New Staff Member",
      message: "Sarah Johnson has been added to the team",
      time: "Yesterday",
      read: true,
      icon: Users,
    },
    {
      id: 7,
      type: "sales",
      title: "New Order Placed",
      message: "Order #7652 has been placed for $124.95",
      time: "2 days ago",
      read: true,
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="flex flex-col">
      <header className="border-b">
        <div className="container py-4">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">View and manage your notifications</p>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">2 Unread Notifications</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Notification Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>View all your recent notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start p-4 border rounded-lg ${notification.read ? "" : "bg-primary/5 border-primary/20"}`}
                    >
                      <div className="mr-4 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <notification.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Button variant="ghost" size="sm" className="ml-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="unread" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Unread Notifications</CardTitle>
                <CardDescription>View your unread notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start p-4 border rounded-lg bg-primary/5 border-primary/20"
                      >
                        <div className="mr-4 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <notification.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{notification.title}</h3>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inventory" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Notifications</CardTitle>
                <CardDescription>View notifications related to inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.type === "inventory")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start p-4 border rounded-lg ${notification.read ? "" : "bg-primary/5 border-primary/20"}`}
                      >
                        <div className="mr-4 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <notification.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{notification.title}</h3>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <Button variant="ghost" size="sm" className="ml-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default NotificationsPage;