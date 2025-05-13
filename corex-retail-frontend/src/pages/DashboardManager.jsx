import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../configs/AuthContext.jsx";
import LogoutButton from "../configs/Logout.jsx";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "../components/Loading.jsx";
import { useStaff } from "../configs/StaffContext.jsx";
import { useProfile } from "../configs/ProfileContext.jsx";
import NotificationHeader from "../components/NotificationHeader.jsx";
import { useInventory } from "../configs/InventoryContext.jsx";
import { useSales } from "../configs/SalesContext.jsx";
import { Separator } from "@/components/ui/separator";
import { SalesOverviewChart } from "@/components/charts/SalesOverviewChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRequest } from "../configs/RequestsContext.jsx";
import { useToast } from "../components/ui/use-toast.jsx";

// Import icons from lucide-react
import {
  BarChart3,
  Bell,
  Calendar,
  Clock,
  FileText,
  Package,
  PoundSterling,
  Settings,
  ShoppingBag,
  TrendingUp,
  User,
  Users,
  Loader2,
  RefreshCw,
  FileEdit,
  Key,
  UserCheck,
  UserX,
  LogIn,
  AlertCircle,
  Clipboard,
  CheckSquare,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Info,
  Filter,
  CalendarDays,
  UserPlus,
  Briefcase,
  Hourglass,
  ShoppingCart,
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
  const { staff, newStaffCount, fetchSchedulesForToday } = useStaff();
  const [refreshingActivities, setRefreshingActivities] = useState(false);
  const { inventoryValue, formatCurrency, refreshInventoryValue } =
    useInventory();
  const { dashboardData } = useSales();
  const { activityData, activityLoading, activityError, fetchActivityData } =
    useProfile();
  const { pendingRequests, myRequests, fetchMyRequests, fetchPendingRequests } =
    useRequest();
  const { toast } = useToast();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [upcomingShifts, setUpcomingShifts] = useState([]);

  useEffect(() => {
    const loadActivityData = async () => {
      try {
        await fetchActivityData(5);
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    };

    loadActivityData();

    // Load requests
    if (fetchMyRequests && fetchPendingRequests) {
      fetchMyRequests();
      fetchPendingRequests();
    }

    // Load today's schedule
    const loadTodaySchedule = async () => {
      setSchedulesLoading(true);
      try {
        // This would be replaced with the actual API call
        const schedules = await fetchSchedulesForToday();
        setTodaySchedule(schedules || []);

        // Generate some sample upcoming shifts if the API doesn't provide them
        const currentDate = new Date();
        const sampleShifts = [
          {
            id: "shift1",
            date: new Date(currentDate.setDate(currentDate.getDate() + 1)),
            startTime: "09:00",
            endTime: "17:00",
            staffName: "You (Manager Shift)",
            role: "Manager",
          },
          {
            id: "shift2",
            date: new Date(currentDate.setDate(currentDate.getDate() + 3)),
            startTime: "10:00",
            endTime: "18:00",
            staffName: "You (Manager Shift)",
            role: "Manager",
          },
        ];
        setUpcomingShifts(sampleShifts);
      } catch (error) {
        console.error("Error loading schedules:", error);
      } finally {
        setSchedulesLoading(false);
      }
    };

    loadTodaySchedule();
  }, [
    fetchActivityData,
    fetchMyRequests,
    fetchPendingRequests,
    fetchSchedulesForToday,
  ]);

  const getChangeColor = () => {
    if (inventoryValue.change > 0) return "text-green-600";
    if (inventoryValue.change < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getSalesTrendIcon = () => {
    if (!dashboardData) return null;
    if (dashboardData.dailySalesTrend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600 ml-1" />;
    } else if (dashboardData.dailySalesTrend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600 ml-1" />;
    }
    return null;
  };

  const ActivityIcon = ({ type }) => {
    switch (type) {
      case "login":
        return <LogIn className="h-5 w-5 text-primary" />;
      case "profile_update":
        return <FileEdit className="h-5 w-5 text-primary" />;
      case "password_change":
        return <Key className="h-5 w-5 text-primary" />;
      case "profile_picture_update":
        return <UserCheck className="h-5 w-5 text-primary" />;
      case "logout":
        return <UserX className="h-5 w-5 text-primary" />;
      case "settings_update":
        return <Settings className="h-5 w-5 text-primary" />;
      case "reports_view":
        return <FileText className="h-5 w-5 text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  const formatChange = () => {
    const prefix = inventoryValue.change >= 0 ? "+" : "";
    return `${prefix}${formatCurrency(inventoryValue.change)} since last month`;
  };

  const handleValueRefresh = () => {
    refreshInventoryValue();
    toast({
      title: "Refreshing",
      description: "Updating inventory value data...",
    });
  };

  const handleRefreshActivities = async () => {
    setRefreshingActivities(true);
    try {
      await fetchActivityData(5);
      toast({
        title: "Activities Refreshed",
        description: "Your activity list has been updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshingActivities(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";

    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate staff on shift today
  const getStaffOnShiftToday = () => {
    return todaySchedule ? todaySchedule.length : 0;
  };

  // Get pending request count
  const getPendingRequestsCount = () => {
    return pendingRequests ? pendingRequests.length : 0;
  };

  // Get upcoming request count
  const getUpcomingShiftsCount = () => {
    return upcomingShifts ? upcomingShifts.length : 0;
  };

  // Calculate low stock items
  const getLowStockCount = () => {
    return Math.floor(Math.random() * 10) + 1; // Simulated data
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        {/* Header with Manager Info and Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={userData?.profilePicture} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {userData?.firstName
                    ? userData.firstName.charAt(0) + userData.lastName.charAt(0)
                    : "M"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {userData?.firstName + " " + userData?.lastName ||
                    user?.displayName || <LoadingSpinner />}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Store Manager • {userData?.email || "Not Found"}
                </p>
                <div className="flex items-center mt-1 text-xs font-medium text-primary">
                  <Clock className="h-3 w-3 mr-1" />
                  Last login: Today, 8:32 AM
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <NotificationHeader />

              <Button
                variant="outline"
                onClick={() => navigate("./more/profile")}
                className="flex-1 md:flex-none"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-10 p-0 flex-1 md:flex-none"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigate("./schedules/create")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("./requests/create")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    New Request
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("./inventory")}>
                    <Package className="h-4 w-4 mr-2" />
                    Check Inventory
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("./more/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <UserX className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Manager Dashboard Tabs */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            {/* Main KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Today's Staff
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {getStaffOnShiftToday()}
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Staff scheduled today
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="./schedules"
                      className="text-xs font-medium text-primary flex items-center"
                    >
                      View Schedule <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Pending Requests
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {getPendingRequestsCount()}
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Requests needing approval
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="./requests"
                      className="text-xs font-medium text-primary flex items-center"
                    >
                      View Requests <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Your Shifts
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-700 dark:text-green-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {getUpcomingShiftsCount()}
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upcoming shifts
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="./schedules"
                      className="text-xs font-medium text-primary flex items-center"
                    >
                      View Calendar <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Low Stock
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <Package className="h-4 w-4 text-red-700 dark:text-red-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{getLowStockCount()}</div>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Items requiring restock
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="./inventory"
                      className="text-xs font-medium text-primary flex items-center"
                    >
                      View Inventory <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Activity Section */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Today's Sales Card */}
              <Card className="bg-white dark:bg-slate-800 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Sales</CardTitle>
                  <CardDescription>Daily performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">
                        {dashboardData
                          ? formatCurrency(dashboardData.dailyRevenue || 0)
                          : "£0.00"}
                      </p>
                      <div className="flex items-center text-sm mt-2">
                        <span
                          className={
                            dashboardData && dashboardData.dailySalesTrend > 0
                              ? "text-green-600"
                              : dashboardData &&
                                dashboardData.dailySalesTrend < 0
                              ? "text-red-600"
                              : "text-slate-500"
                          }
                        >
                          {dashboardData && dashboardData.dailySalesTrend > 0
                            ? `+${dashboardData.dailySalesTrend}%`
                            : dashboardData && dashboardData.dailySalesTrend < 0
                            ? `${dashboardData.dailySalesTrend}%`
                            : "0%"}
                        </span>
                        {getSalesTrendIcon()}
                        <span className="text-xs text-slate-500 ml-2">
                          vs yesterday
                        </span>
                      </div>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <PoundSterling className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-slate-500">Transactions</p>
                      <p className="font-bold mt-1">
                        {dashboardData?.dailyTransactions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Avg. Value</p>
                      <p className="font-bold mt-1">
                        {dashboardData && dashboardData.dailyTransactions
                          ? formatCurrency(
                              dashboardData.dailyRevenue /
                                dashboardData.dailyTransactions
                            )
                          : "£0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Items Sold</p>
                      <p className="font-bold mt-1">
                        {dashboardData?.dailyItemsSold || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link to="./sales">
                      <Button variant="outline" className="w-full">
                        Full Sales Report
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="bg-white dark:bg-slate-800 md:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Manager Tasks</CardTitle>
                      <CardDescription>
                        Priority items for today
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("./schedules/create")}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Approve Staff Requests</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getPendingRequestsCount()} pending approval
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate("./requests")}
                        variant="ghost"
                        size="sm"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                        <Clipboard className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Review Today's Schedule</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getStaffOnShiftToday()} staff scheduled today
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate("./schedules")}
                        variant="ghost"
                        size="sm"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-4">
                        <Package className="h-5 w-5 text-red-700 dark:text-red-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Check Low Stock Items</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getLowStockCount()} items need attention
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate("./inventory")}
                        variant="ghost"
                        size="sm"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                        <BarChart3 className="h-5 w-5 text-green-700 dark:text-green-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Check Sales Performance</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Daily sales overview
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate("./sales")}
                        variant="ghost"
                        size="sm"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Recent Activity Card */}
              <Card className="bg-white dark:bg-slate-800 lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent actions and system events
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshActivities}
                    disabled={refreshingActivities}
                  >
                    {refreshingActivities ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : activityError ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                      <p className="text-destructive">{activityError}</p>
                      <Button
                        onClick={handleRefreshActivities}
                        variant="outline"
                        size="sm"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : activityData && activityData.length > 0 ? (
                    <div className="space-y-4">
                      {activityData.map((activity, index) => (
                        <React.Fragment key={activity.id || index}>
                          <div className="flex items-start">
                            <div className="mr-4 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <ActivityIcon type={activity.type} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">
                                  {activity.title}
                                </h3>
                                <span className="text-xs text-slate-500">
                                  {activity.timestamp}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">
                                {activity.description}
                              </p>
                            </div>
                          </div>
                          {index < activityData.length - 1 && <Separator />}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <Clock className="h-12 w-12 text-slate-300" />
                      <p className="text-slate-500">
                        No activity recorded yet.
                      </p>
                      <p className="text-xs text-slate-400 text-center max-w-md">
                        Your recent account activities will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common manager tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => navigate("./requests/create")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create New Request
                  </Button>

                  <Button
                    onClick={() => navigate("./schedules/create")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>

                  <Button
                    onClick={() => navigate("./staff")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Staff
                  </Button>

                  <Button
                    onClick={() => navigate("./inventory")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Check Inventory
                  </Button>

                  <Button
                    onClick={() => navigate("./sales")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Sales Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab Content */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Today's Schedule */}
              <Card className="lg:col-span-2 bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Today's Schedule
                      </CardTitle>
                      <CardDescription>Staff on shift today</CardDescription>
                    </div>
                    <Button
                      onClick={() => navigate("./schedules/create")}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Shift
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {schedulesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : todaySchedule && todaySchedule.length > 0 ? (
                    <div className="space-y-3">
                      {todaySchedule.map((shift, index) => (
                        <div
                          key={shift.id || index}
                          className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {shift.staffName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{shift.staffName}</p>
                            <p className="text-sm text-slate-500">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
                            {shift.role || "Staff"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <Calendar className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                        No shifts scheduled today
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                        There are no staff members scheduled to work today.
                      </p>
                      <Button onClick={() => navigate("./schedules/create")}>
                        Create Schedule
                      </Button>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("./schedules")}
                    >
                      View Full Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Your Upcoming Shifts */}
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Your Upcoming Shifts
                  </CardTitle>
                  <CardDescription>
                    Your next scheduled workdays
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingShifts && upcomingShifts.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingShifts.map((shift, index) => (
                        <div
                          key={index}
                          className="p-3 bg-primary/5 rounded-lg border border-primary/10"
                        >
                          <div className="flex items-center">
                            <CalendarDays className="h-5 w-5 text-primary mr-3" />
                            <p className="font-medium">
                              {formatDate(shift.date)}
                            </p>
                          </div>
                          <div className="mt-2 pl-8">
                            <p className="text-sm text-slate-500">
                              {shift.startTime} - {shift.endTime}
                            </p>
                            <p className="text-xs font-medium text-primary mt-1">
                              {shift.role || "Manager"}
                            </p>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("./more/profile")}
                      >
                        View All Shifts
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Hourglass className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                        No upcoming shifts
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        You don't have any scheduled shifts.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Schedule Management Tools */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                      <UserPlus className="h-6 w-6 text-green-700 dark:text-green-300" />
                    </div>
                    <h3 className="font-medium mb-1">Create Shift</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Schedule new staff shifts
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("./schedules/create")}
                      className="w-full"
                    >
                      Create
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                      <Briefcase className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                    </div>
                    <h3 className="font-medium mb-1">Team Overview</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      View staff details
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("./staff")}
                      className="w-full"
                    >
                      View Team
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                      <Clock className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
                    </div>
                    <h3 className="font-medium mb-1">Weekly Schedule</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Plan weekly shifts
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("./schedules")}
                      className="w-full"
                    >
                      View Week
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                    </div>
                    <h3 className="font-medium mb-1">Staff Requests</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Manage time off requests
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("./requests")}
                      className="w-full"
                    >
                      View Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab Content */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Pending Approvals */}
              <Card className="lg:col-span-2 bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Pending Approvals
                      </CardTitle>
                      <CardDescription>
                        Staff requests awaiting your decision
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => navigate("./requests")}
                      size="sm"
                      variant="outline"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingRequests && pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.slice(0, 3).map((request, index) => (
                        <div
                          key={request.id || index}
                          className="p-4 border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {request.requesterName
                                    ? request.requesterName.charAt(0)
                                    : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {request.requesterName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {request.requesterRole}
                                </p>
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                              {request.requestType.replace(/_/g, " ")}
                            </div>
                          </div>

                          <div className="flex items-center text-sm my-2">
                            <Calendar className="h-4 w-4 text-slate-500 mr-2" />
                            <span>
                              {formatDate(request.startDate)}
                              {request.endDate &&
                              request.endDate !== request.startDate
                                ? ` - ${formatDate(request.endDate)}`
                                : ""}
                            </span>
                          </div>

                          <div className="mt-3 flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-700 border-red-200 dark:border-red-800 dark:text-red-300"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}

                      {pendingRequests.length > 3 && (
                        <div className="text-center pt-2">
                          <Button
                            variant="link"
                            onClick={() => navigate("./requests")}
                          >
                            View {pendingRequests.length - 3} more pending
                            requests
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <CheckSquare className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                        No pending requests
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                        There are no staff requests waiting for your approval.
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("./requests")}
                    >
                      Manage All Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Your Requests */}
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Your Requests</CardTitle>
                      <CardDescription>
                        Requests you've submitted
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => navigate("./requests/create")}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {myRequests && myRequests.length > 0 ? (
                    <div className="space-y-3">
                      {myRequests.slice(0, 4).map((request, index) => (
                        <div
                          key={request.id || index}
                          className="p-3 border rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium text-sm capitalize">
                              {request.requestType.replace(/_/g, " ")}
                            </p>
                            <div
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                request.status === "approved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : request.status === "rejected"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              }`}
                            >
                              {request.status}
                            </div>
                          </div>

                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {formatDate(request.startDate)}
                              {request.endDate &&
                              request.endDate !== request.startDate
                                ? ` - ${formatDate(request.endDate)}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      ))}

                      {myRequests.length > 4 && (
                        <div className="text-center pt-2">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => navigate("./requests")}
                            className="text-sm"
                          >
                            View all your requests
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <FileText className="h-10 w-10 text-slate-300 mb-3" />
                      <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
                        No requests found
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">
                        You haven't created any requests yet
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("./requests/create")}
                      >
                        Create Request
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Request Management Tools */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                      <Plus className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                    </div>
                    <h3 className="font-medium mb-1">Create Request</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Submit a new request
                    </p>
                    <Button
                      onClick={() => navigate("./requests/create")}
                      className="w-full"
                    >
                      Create New
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                      <Filter className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                    </div>
                    <h3 className="font-medium mb-1">View All</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      See all requests
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("./requests")}
                      className="w-full"
                    >
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                      <Info className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
                    </div>
                    <h3 className="font-medium mb-1">Request Types</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Learn about request types
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("./more/help")}
                      className="w-full"
                    >
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab Content */}
          <TabsContent value="sales" className="space-y-6">
            {/* Sales Overview */}
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Sales Overview</CardTitle>
                    <CardDescription>Store performance metrics</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("./sales")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SalesOverviewChart />
                </div>
              </CardContent>
            </Card>

            {/* Today's Numbers */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Sales
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {dashboardData
                          ? formatCurrency(dashboardData.dailyRevenue || 0)
                          : "£0.00"}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Today's revenue
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <PoundSterling className="h-5 w-5 text-green-700 dark:text-green-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {dashboardData?.dailyTransactions || 0}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Orders today
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Sale
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {dashboardData && dashboardData.dailyTransactions
                          ? formatCurrency(
                              dashboardData.dailyRevenue /
                                dashboardData.dailyTransactions
                            )
                          : "£0.00"}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Per transaction
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Inventory Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(inventoryValue.currentValue)}
                      </div>
                      <p className={`text-xs ${getChangeColor()} mt-1`}>
                        {formatChange()}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Reports Links */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-green-700 dark:text-green-300" />
                    </div>
                    <h3 className="font-medium mb-1">Sales Reports</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      View detailed sales data
                    </p>
                    <Button
                      onClick={() => navigate("./sales/reports")}
                      className="w-full"
                    >
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                    </div>
                    <h3 className="font-medium mb-1">Performance</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Track store growth
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("./sales/performance")}
                      className="w-full"
                    >
                      View Trends
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                      <Package className="h-6 w-6 text-red-700 dark:text-red-300" />
                    </div>
                    <h3 className="font-medium mb-1">Inventory</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Check stock status
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("./inventory")}
                      className="w-full"
                    >
                      View Stock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <div className="flex justify-center mt-8">
          <LogoutButton />
        </div>
      </main>
    </div>
  );
};

export default DashboardManager;
