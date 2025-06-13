import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  FileText,
  Package,
  UserCircle,
  CalendarDays,
  RefreshCw,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const StaffOverview = ({
  nextShift,
  dashboardStats,
  activityData,
  onNavigate,
  onRefresh,
  onTabChange, // New prop for tab switching
  isLoading,
}) => {
  // Handle quick action clicks - some navigate to routes, others change tabs
  const handleQuickAction = (action) => {
    switch (action) {
      case "request":
        // For request leave, we can either switch to requests tab or navigate to create form
        // Let's switch to requests tab first, then they can click "New Request"
        if (onTabChange) {
          onTabChange("requests");
        }
        break;
      case "schedule":
        if (onTabChange) {
          onTabChange("schedule");
        }
        break;
      case "inventory":
        if (onTabChange) {
          onTabChange("inventory");
        }
        break;
      case "profile":
        // Profile page exists as a separate route, so navigate
        onNavigate("./profile");
        break;
      default:
        if (onNavigate) {
          onNavigate(action);
        }
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Hours This Week
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {dashboardStats.totalHoursThisWeek}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Monthly Hours
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {dashboardStats.totalHoursThisMonth}h
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Upcoming Shifts
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {dashboardStats.upcomingShiftsCount}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardStats.pendingRequestsCount}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Shift Card */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Next Shift
            </CardTitle>
            {nextShift && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Upcoming
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {nextShift ? (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{nextShift.date}</h3>
                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {nextShift.shift.startTime} - {nextShift.shift.endTime}
                  </p>
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {nextShift.shift.notes || "Regular Shift"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("schedule")}
                >
                  View Full Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("request")}
                >
                  Request Time Off
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <CalendarDays className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                No upcoming shifts scheduled
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Check back later for updates or contact your manager
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("schedule")}
                >
                  View Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("request")}
                >
                  Request Time Off
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => handleQuickAction("request")}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-b from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm font-medium">Request Leave</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("schedule")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm font-medium">View Schedule</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("profile")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <UserCircle className="h-6 w-6" />
              <span className="text-sm font-medium">My Profile</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("inventory")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Package className="h-6 w-6" />
              <span className="text-sm font-medium">Check Stock</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activityData && activityData.length > 0 ? (
            <div className="space-y-4">
              {activityData.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {activity.type === "shift" ? (
                      <Calendar className="h-5 w-5 text-primary" />
                    ) : activity.type === "request" ? (
                      <FileText className="h-5 w-5 text-primary" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {activity.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                No recent activity
              </p>
              <p className="text-xs text-slate-500">
                Your recent actions will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffOverview;
