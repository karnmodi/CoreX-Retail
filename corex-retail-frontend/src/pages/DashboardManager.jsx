import React, { useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import NotificationHeader from "../components/NotificationHeader.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardManager = () => {
  const { user, userData, logout } = useAuth();

  return (
    <>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <main className="container mx-auto px-4 py-6">
          <div className="mb-8 flex justify-between items-start">
            {/* Left Side: Welcome Text */}
            <div>
              <h1 className="text-3xl font-bold text-primary flex flex-wrap items-center gap-2">
                Welcome,
                <span className="text-red-500 font-bold">Manager</span>
                <span className="text-blue-600 font-bold">
                  {userData?.firstName + " " + userData?.lastName ||
                    user?.displayName || <LoadingSpinner />}
                </span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {userData?.email || "Not Found"}
              </p>
            </div>

            {/* Right Side: Notification Icon */}
            <div className="ml-auto">
              <NotificationHeader />
            </div>
          </div>

          <Tabs defaultValue="daily" className="space-y-4">
            <TabsContent value="daily" className="space-y-4">
              {/* <DashboardStats /> */}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Sales Overview Chart */}
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {/* <DashboardCharts /> */}
                  </CardContent>
                </Card>

                {/* Recent Sales */}
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>You made 265 sales today</CardDescription>
                  </CardHeader>
                  <CardContent>{/* <RecentSales /> */}</CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default DashboardManager;
