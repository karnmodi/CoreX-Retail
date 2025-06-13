import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../configs/AuthContext.jsx";

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
import { Badge } from "@/components/ui/badge";

// Context Hooks
import { useProfile } from "../configs/ProfileContext.jsx";
import { useInventory } from "../configs/InventoryContext.jsx";
import { useRequest } from "../configs/RequestsContext.jsx";
import { useRoster } from "../configs/RostersContext.jsx";

// Icons
import {
  Calendar,
  Clock,
  FileText,
  Package,
  Settings,
  User,
  Loader2,
  RefreshCw,
  ChevronRight,
  MoreHorizontal,
  CalendarDays,
  LogOut,
  UserCircle,
  Info,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the new components
import StaffOverview from "../components/Staff/StaffOverview.jsx";
import StaffRostersView from "../components/Staff/StaffRostersView.jsx";
import StaffRequestsView from "../components/Staff/StaffRequestsView.jsx";
import StaffInventoryView from "../components/Staff/StaffInventoryView.jsx";

const DashboardStaff = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const { profileData, activityData, fetchActivityData } = useProfile();
  const { lowStockProducts } = useInventory();
  const { myRequests, fetchMyRequests, submitRequest, stats, removeRequest } =
    useRequest();
  const {
    getFormattedUpcomingShifts,
    fetchUpcomingShifts,
    upcomingShifts,
    upcomingLoading,
    fetchShiftsForDate,
  } = useRoster();
  const { toast } = useToast();

  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [formattedShifts, setFormattedShifts] = useState([]);
  const [nextShift, setNextShift] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // New state for active tab
  const [dashboardStats, setDashboardStats] = useState({
    totalHoursThisWeek: 0,
    totalHoursThisMonth: 0,
    upcomingShiftsCount: 0,
    pendingRequestsCount: 0,
  });

  // Default stats in case of undefined
  const safeStats = {
    totalHoursThisWeek: dashboardStats?.totalHoursThisWeek || 0,
    totalHoursThisMonth: dashboardStats?.totalHoursThisMonth || 0,
    upcomingShiftsCount: dashboardStats?.upcomingShiftsCount || 0,
    pendingRequestsCount: dashboardStats?.pendingRequestsCount || 0,
  };

  // Handle tab change function
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  // Enhanced navigate function that can handle both routes and tabs
  const handleNavigate = (path) => {
    // Check if it's a route that should open a new page
    if (path.includes("./profile") || path.includes("./requests/create")) {
      navigate(path);
    } else {
      // Handle internal tab navigation
      switch (path) {
        case "./schedules":
        case "schedule":
          setActiveTab("schedule");
          break;
        case "./requests":
        case "requests":
          setActiveTab("requests");
          break;
        case "./inventory":
        case "inventory":
          setActiveTab("inventory");
          break;
        default:
          navigate(path);
      }
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user && user.uid) {
        console.log("Fetching dashboard data for user:", user.uid);

        console.log("Calling fetchUpcomingShifts...");
        await fetchUpcomingShifts(user.uid, 30);

        const today = new Date();
        console.log("Calling fetchShiftsForDate for today...");
        await fetchShiftsForDate(today);

        console.log("Calling fetchMyRequests...");
        await fetchMyRequests();

        console.log("Calling fetchActivityData...");
        await fetchActivityData(5); // Get more activity data

        console.log("Dashboard data fetch completed");
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
  }, [
    fetchUpcomingShifts,
    fetchShiftsForDate,
    fetchMyRequests,
    fetchActivityData,
    user,
    toast,
  ]);

  // Calculate dashboard statistics
  const calculateStats = useCallback(() => {
    if (!upcomingShifts?.shiftsByDate) return;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let weeklyHours = 0;
    let monthlyHours = 0;
    let upcomingCount = 0;

    Object.entries(upcomingShifts.shiftsByDate).forEach(([date, shifts]) => {
      const shiftDate = new Date(date);

      shifts.forEach((shift) => {
        const startTime = new Date(`${date}T${shift.startTime}`);
        const endTime = new Date(`${date}T${shift.endTime}`);
        const hours = (endTime - startTime) / (1000 * 60 * 60);

        if (shiftDate >= startOfWeek) {
          weeklyHours += hours;
        }
        if (shiftDate >= startOfMonth) {
          monthlyHours += hours;
        }
        if (shiftDate >= now.setHours(0, 0, 0, 0)) {
          upcomingCount++;
        }
      });
    });

    setDashboardStats({
      totalHoursThisWeek: Math.round(weeklyHours * 10) / 10,
      totalHoursThisMonth: Math.round(monthlyHours * 10) / 10,
      upcomingShiftsCount: upcomingCount,
      pendingRequestsCount: stats.myPendingCount || 0,
    });
  }, [upcomingShifts, stats]);

  // Process upcoming shifts
  useEffect(() => {
    console.log("Processing upcoming shifts:", upcomingShifts);
    if (upcomingShifts?.shiftsByDate) {
      const upcoming = getFormattedUpcomingShifts();
      console.log("Formatted shifts:", upcoming);
      setFormattedShifts(upcoming);

      // Find the next upcoming shift
      if (upcoming.length > 0) {
        const today = new Date().setHours(0, 0, 0, 0);
        const nextShiftData = upcoming.find((shift) => {
          const shiftDate = new Date(shift.date).setHours(0, 0, 0, 0);
          return shiftDate >= today && shift.shifts.length > 0;
        });

        if (nextShiftData && nextShiftData.shifts.length > 0) {
          setNextShift({
            date: nextShiftData.formattedDate,
            shift: nextShiftData.shifts[0],
          });
        }
      }

      // Calculate statistics
      calculateStats();
    }
  }, [upcomingShifts, getFormattedUpcomingShifts, calculateStats]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        {/* Profile Header - Compact */}
        <Card className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-primary">
                  <AvatarImage src={profileData?.profilePicture} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {profileData?.firstName
                      ? profileData.firstName.charAt(0) +
                        profileData.lastName.charAt(0)
                      : user?.email?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {profileData?.firstName
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : user?.displayName || "Staff Member"}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {userData?.role || "Staff"} • {user?.email || ""}
                  </p>
                </div>
              </div>

              {/* Quick Stats Display */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-primary">
                    {safeStats.totalHoursThisWeek}h
                  </p>
                  <p className="text-xs text-slate-500">This Week</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">
                    {safeStats.upcomingShiftsCount}
                  </p>
                  <p className="text-xs text-slate-500">Upcoming</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-orange-600">
                    {safeStats.pendingRequestsCount}
                  </p>
                  <p className="text-xs text-slate-500">Pending</p>
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
                      <DropdownMenuItem onClick={() => navigate("./profile")}>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTabChange("schedule")}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTabChange("requests")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Requests
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("./requests/create")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Request Leave
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

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

        {/* Staff Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview">
            <StaffOverview
              nextShift={nextShift}
              dashboardStats={safeStats}
              activityData={activityData}
              onNavigate={handleNavigate}
              onTabChange={handleTabChange} // Pass tab change function
              onRefresh={fetchDashboardData}
              isLoading={upcomingLoading}
            />
          </TabsContent>

          {/* Schedule Tab Content */}
          <TabsContent value="schedule">
            <StaffRostersView
              formattedShifts={formattedShifts}
              upcomingShifts={upcomingShifts}
              dashboardStats={safeStats}
              onNavigate={handleNavigate}
              onRefreshShifts={() => fetchUpcomingShifts(user?.uid, 30)}
              isLoading={upcomingLoading}
            />
          </TabsContent>

          {/* Requests Tab Content */}
          <TabsContent value="requests">
            <StaffRequestsView
              myRequests={myRequests}
              stats={stats || {}}
              onNavigate={handleNavigate}
              onRefresh={fetchMyRequests}
              onCancelRequest={removeRequest} // Add cancel request functionality
              isLoading={false}
            />
          </TabsContent>

          {/* Inventory Tab Content */}
          <TabsContent value="inventory">
            <StaffInventoryView
              lowStockProducts={lowStockProducts}
              onNavigate={handleNavigate}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardStaff;
