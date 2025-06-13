import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../configs/AuthContext.jsx";
import LogoutButton from "../configs/Logout.jsx";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "../components/Loading.jsx";
import NotificationHeader from "../components/NotificationHeader.jsx";
import { useToast } from "../components/ui/use-toast.jsx";

// Context Hooks
import { useStaff } from "../configs/StaffContext.jsx";
import { useProfile } from "../configs/ProfileContext.jsx";
import { useInventory } from "../configs/InventoryContext.jsx";
import { useSales } from "../configs/SalesContext.jsx";
import { useRequest } from "../configs/RequestsContext.jsx";
import { useRoster } from "../configs/RostersContext.jsx";

// Icons
import {
  BarChart3,
  Calendar,
  Clock,
  FileText,
  Package,
  PoundSterling,
  Settings,
  User,
  Users,
  Loader2,
  RefreshCw,
  CheckSquare,
  ChevronRight,
  MoreHorizontal,
  Plus,
  TrendingUp,
  LogOut,
  TrendingDown,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardManager = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const { newStaffCount } = useStaff();
  const { fetchShiftsForDate, shifts } = useRoster();
  const { inventoryValue, formatCurrency, lowStockProducts } = useInventory();
  const { dashboardData, refreshDashboard: loadDashboardData } = useSales();
  const { activityData, fetchActivityData } = useProfile();
  const { pendingRequests, myRequests } = useRequest();
  const { toast } = useToast();

  // Component state
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadDashboardData();

      const today = new Date();
      await fetchShiftsForDate(today);

      if (user && user.uid) {
        await fetchActivityData(3);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadDashboardData, fetchShiftsForDate, fetchActivityData, user, toast]);

  useEffect(() => {
    if (shifts && shifts.length > 0) {
      const formattedShifts = shifts.map((shift) => ({
        id: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        staffName: shift.employeeId?.username || "Staff Member",
        role: shift.shiftNote || "Staff",
      }));

      setTodaySchedule(formattedShifts);
    } else {
      setTodaySchedule([]);
    }
  }, [shifts]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getChangeColor = () => {
    if (inventoryValue.change > 0) return "text-green-600";
    if (inventoryValue.change < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getSalesTrendIcon = () => {
    if (!dashboardData || !dashboardData.today) return null;
    if (dashboardData.today.percentChange > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600 ml-1" />;
    } else if (dashboardData.today.percentChange < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600 ml-1" />;
    }
    return null;
  };

  const formatChange = () => {
    const prefix = inventoryValue.change >= 0 ? "+" : "";
    return `${prefix}${formatCurrency(inventoryValue.change)} since last month`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-4">
        {/* Profile Header - Smaller and More Compact */}
        <Card className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-12 w-12 border border-primary">
                  <AvatarImage src={userData?.profilePicture} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {userData?.firstName
                      ? userData.firstName.charAt(0) +
                        userData.lastName.charAt(0)
                      : "M"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {userData?.firstName + " " + userData?.lastName ||
                      user?.displayName ||
                      "Manager"}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Store Manager • {userData?.email || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative">
                <NotificationHeader />
                <div className="relative z-10 inline-block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48"
                      sideOffset={4}
                      align="start"
                      alignOffset={0}
                      side="bottom"
                      avoidCollisions
                    >
                      <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => navigate("./more/profile")}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("./more/requests/create")}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Request Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("./more/requests/create")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        New Request
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate("./more/settings")}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout}>
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tabs - Simplified */}
        <Tabs defaultValue="overview" className="mb-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content - Simplified */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {/* Staff Card */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">Today's Staff</div>
                    <Users className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="text-2xl font-bold">
                    { todaySchedule.length}
                  </div>
                  <Link
                    to="./schedules"
                    className="text-xs font-medium text-primary flex items-center mt-2"
                  >
                    View Schedule <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>

              {/* Requests Card */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">Pending Requests</div>
                    <FileText className="h-4 w-4 text-yellow-700" />
                  </div>
                  <div className="text-2xl font-bold">
                    {pendingRequests?.length || 0}
                  </div>
                  <Link
                    to="./more/requests"
                    className="text-xs font-medium text-primary flex items-center mt-2"
                  >
                    View Requests <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>

              {/* Sales Card */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">Today's Sales</div>
                    <PoundSterling className="h-4 w-4 text-green-700" />
                  </div>
                  <div className="text-2xl font-bold">
                    {dashboardData
                      ? formatCurrency(dashboardData.today?.totalAmount || 0)
                      : "£0.00"}
                  </div>
                  <Link
                    to="./sales/Daily"
                    className="text-xs font-medium text-primary flex items-center mt-2"
                  >
                    View Sales <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>

              {/* Inventory Card */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">Low Stock</div>
                    <Package className="h-4 w-4 text-red-700" />
                  </div>
                  <div className="text-2xl font-bold">
                    {lowStockProducts?.length || 0}
                  </div>
                  <Link
                    to="./inventory/viewInventory"
                    className="text-xs font-medium text-primary flex items-center mt-2"
                  >
                    View Inventory <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity - Simplified */}
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDashboardData}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activityData && activityData.length > 0 ? (
                  <div className="space-y-3">
                    {activityData.slice(0, 3).map((activity, index) => (
                      <div
                        key={activity.id || index}
                        className="flex items-start"
                      >
                        <div className="mr-3 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">
                              {activity.title}
                            </h3>
                            <span className="text-xs text-slate-500">
                              {activity.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-4">
                    <p className="text-sm text-slate-500">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions - Simplified */}
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  onClick={() => navigate("./more/requests/create")}
                  variant="outline"
                  size="sm"
                  className="flex-grow basis-0 min-w-[40%]"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  New Request
                </Button>
                <Button
                  onClick={() => navigate("./schedules")}
                  variant="outline"
                  size="sm"
                  className="flex-grow basis-0 min-w-[40%]"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button
                  onClick={() => navigate("./staff/manage")}
                  variant="outline"
                  size="sm"
                  className="flex-grow basis-0 min-w-[40%]"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Staff
                </Button>
                <Button
                  onClick={() => navigate("./inventory/viewInventory")}
                  variant="outline"
                  size="sm"
                  className="flex-grow basis-0 min-w-[40%]"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab Content - Simplified */}
          <TabsContent value="schedule" className="space-y-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Today's Schedule</CardTitle>
                  <Button
                    onClick={() => navigate("./more/requests/create")}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shift
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {schedulesLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : todaySchedule && todaySchedule.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedule.slice(0, 3).map((shift, index) => (
                      <div
                        key={shift.id || index}
                        className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {shift.staffName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {shift.staffName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                      </div>
                    ))}
                    {todaySchedule.length > 3 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate("./schedules")}
                        className="w-full"
                      >
                        View all {todaySchedule.length} staff members
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <CheckSquare className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-600">
                      No shifts scheduled today
                    </p>
                    <Button
                      onClick={() => navigate("./more/requests/create")}
                      size="sm"
                      className="mt-3"
                    >
                      Request Schedule
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab Content - Simplified */}
          <TabsContent value="sales" className="space-y-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Sales Overview</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadDashboardData}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!dashboardData ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            dashboardData.today?.totalAmount || 0
                          )}
                        </p>
                        <div className="flex items-center text-sm mt-1">
                          <span
                            className={
                              dashboardData.today?.percentChange > 0
                                ? "text-green-600"
                                : dashboardData.today?.percentChange < 0
                                ? "text-red-600"
                                : "text-slate-500"
                            }
                          >
                            {dashboardData.today?.percentChange > 0
                              ? `+${dashboardData.today.percentChange.toFixed(
                                  1
                                )}%`
                              : dashboardData.today?.percentChange < 0
                              ? `${dashboardData.today.percentChange.toFixed(
                                  1
                                )}%`
                              : "0%"}
                            {getSalesTrendIcon()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Transactions</p>
                        <p className="font-semibold">
                          {dashboardData.today?.transactionCount || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Avg. Value</p>
                        <p className="font-semibold">
                          {dashboardData.today?.transactionCount
                            ? formatCurrency(
                                dashboardData.today.totalAmount /
                                  dashboardData.today.transactionCount
                              )
                            : "£0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Items Sold</p>
                        <p className="font-semibold">
                          {dashboardData.today?.totalQuantity || 0}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => navigate("./sales/Daily")}
                    >
                      View Full Sales Report
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Inventory Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(inventoryValue.currentValue)}
                    </p>
                    <p className={`text-xs ${getChangeColor()} mt-1`}>
                      {formatChange()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold">
                        {lowStockProducts.length}
                      </span>{" "}
                      items low on stock
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  size="sm"
                  onClick={() => navigate("./inventory/viewInventory")}
                >
                  View Inventory
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardManager;
