import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  FileText,
  RefreshCw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Timer,
  Loader2,
} from "lucide-react";
import StaffPersonalSchedule from "./StaffPersonalSchedule.jsx";
import { useRoster } from "../../configs/RostersContext.jsx";
import { useAuth } from "../../configs/AuthContext";

const StaffRostersView = ({
  formattedShifts = [],
  upcomingShifts = {},
  dashboardStats = {},
  onNavigate,
  onRefreshShifts,
  isLoading = false,
}) => {
  const [currentView, setCurrentView] = useState("schedule"); // 'list', 'calendar', or 'schedule'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [monthlyShifts, setMonthlyShifts] = useState([]); // Fixed: Initialize as array
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const { fetchMonthlyShifts } = useRoster();
  const { user } = useAuth();

  // Ensure safe access to stats with defaults
  const safeStats = {
    totalHoursThisWeek: dashboardStats?.totalHoursThisWeek || 0,
    totalHoursThisMonth: dashboardStats?.totalHoursThisMonth || 0,
    upcomingShiftsCount: dashboardStats?.upcomingShiftsCount || 0,
    pendingRequestsCount: dashboardStats?.pendingRequestsCount || 0,
  };

  // Fetch monthly shifts when calendar date changes or view switches to calendar
  useEffect(() => {
    if (currentView === "calendar" && user?.uid) {
      const fetchCurrentMonthShifts = async () => {
        setMonthlyLoading(true);
        try {
          const month = calendarDate.getMonth() + 1;
          const year = calendarDate.getFullYear();

          const data = await fetchMonthlyShifts(month, year);

          if (data && data.shifts && Array.isArray(data.shifts)) {
            setMonthlyShifts(data.shifts);
          } else {
            setMonthlyShifts([]);
          }
        } catch (error) {
          setMonthlyShifts([]);
        } finally {
          setMonthlyLoading(false);
        }
      };

      fetchCurrentMonthShifts();
    }
  }, [calendarDate, currentView, user, fetchMonthlyShifts]);

  // Calendar generation logic - now uses monthly shifts data
  const generateCalendarData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const calendar = [];
    const currentDate = new Date(startDate);

    // Convert monthly shifts array to a date-indexed object for easier lookup
    const shiftsByDate = {};
    console.log("Processing monthly shifts for calendar:", monthlyShifts);

    if (Array.isArray(monthlyShifts) && monthlyShifts.length > 0) {
      monthlyShifts.forEach((shift) => {
        const dateKey = shift.date; // Format: "2025-05-06"
        if (!shiftsByDate[dateKey]) {
          shiftsByDate[dateKey] = [];
        }
        shiftsByDate[dateKey].push(shift);
      });
    }

    console.log("Shifts organized by date:", shiftsByDate);

    while (currentDate <= endDate) {
      // Use local date string to avoid timezone issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const shiftsForDay = shiftsByDate[dateString] || [];

      calendar.push({
        date: new Date(currentDate),
        dateString,
        shifts: shiftsForDay,
        isCurrentMonth: currentDate.getMonth() === calendarDate.getMonth(),
        isToday: dateString === new Date().toLocaleDateString("en-CA"), // en-CA gives YYYY-MM-DD format
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(
      "Generated calendar data:",
      calendar.filter((day) => day.shifts.length > 0)
    );
    return calendar;
  }, [calendarDate, monthlyShifts]);

  const navigateMonth = (direction) => {
    setCalendarDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDayHours = (shifts) => {
    if (!shifts || shifts.length === 0) return 0;
    return shifts.reduce((total, shift) => {
      if (!shift.startTime || !shift.endTime) return total;
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      return total + (end - start) / (1000 * 60 * 60);
    }, 0);
  };

  const handleRefreshMonthly = async () => {
    if (currentView === "calendar" && user?.uid) {
      setMonthlyLoading(true);
      try {
        const month = calendarDate.getMonth() + 1;
        const year = calendarDate.getFullYear();
        console.log(`Refreshing monthly shifts for ${month}/${year}`);

        const data = await fetchMonthlyShifts(month, year);
        if (data && data.shifts && Array.isArray(data.shifts)) {
          setMonthlyShifts(data.shifts);
          console.log("Refresh successful:", data.shifts);
        } else {
          setMonthlyShifts([]);
          console.log("No shifts in refresh response");
        }
      } catch (error) {
        console.error("Error refreshing monthly shifts:", error);
      } finally {
        setMonthlyLoading(false);
      }
    } else {
      onRefreshShifts();
    }
  };

  // Debug logging
  React.useEffect(() => {
    console.log("StaffRostersView - Current view:", currentView);
    console.log("StaffRostersView - Calendar date:", calendarDate);
    console.log("StaffRostersView - Monthly shifts:", monthlyShifts);
    console.log(
      "StaffRostersView - Monthly shifts type:",
      Array.isArray(monthlyShifts) ? "array" : typeof monthlyShifts
    );
    console.log("StaffRostersView - User data:", user);
  }, [currentView, calendarDate, monthlyShifts, user]);

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Hours This Week
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {safeStats.totalHoursThisWeek}h
                </p>
              </div>
              <Timer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Upcoming Shifts
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {safeStats.upcomingShiftsCount}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Monthly Hours
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {calculateDayHours(monthlyShifts).toFixed(1)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Content */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              My Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <Button
                  variant={currentView === "schedule" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("schedule")}
                  className="h-8"
                >
                  Interactive
                </Button>
                <Button
                  variant={currentView === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("list")}
                  className="h-8"
                >
                  List
                </Button>
                <Button
                  variant={currentView === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("calendar")}
                  className="h-8"
                >
                  Calendar
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshMonthly}
                disabled={isLoading || monthlyLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isLoading || monthlyLoading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentView === "schedule" ? (
            // Interactive Schedule View
            <StaffPersonalSchedule onNavigate={onNavigate} />
          ) : currentView === "list" ? (
            // List View
            <div>
              {formattedShifts && formattedShifts.length > 0 ? (
                <div className="space-y-4">
                  {formattedShifts.slice(0, 10).map((dayData, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {dayData.formattedDate}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {dayData.totalShifts} shift
                            {dayData.totalShifts !== 1 ? "s" : ""} •{" "}
                            {dayData.totalHours}h total
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary"
                        >
                          {dayData.totalHours}h
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {dayData.shifts.map((shift, shiftIndex) => (
                          <div
                            key={shiftIndex}
                            className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">
                                  {formatTime(shift.startTime)} -{" "}
                                  {formatTime(shift.endTime)}
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {shift.shiftNote ||
                                  shift.notes ||
                                  "Regular Shift"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {formattedShifts.length > 10 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => onNavigate("./schedules")}
                    >
                      View All Shifts ({formattedShifts.length} total)
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <CalendarDays className="h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    No shifts scheduled
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 text-center">
                    You don't have any upcoming shifts scheduled.
                    <br />
                    Contact your manager if you expect to see shifts here.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate("./requests/create")}
                  >
                    Request Time Off
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Calendar View
            <div>
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {calendarDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(-1)}
                    disabled={monthlyLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarDate(new Date())}
                    disabled={monthlyLoading}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(1)}
                    disabled={monthlyLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {monthlyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Loading monthly shifts...
                  </p>
                </div>
              ) : (
                <>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="p-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarData.map((day, index) => (
                      <div
                        key={index}
                        className={`
                          min-h-24 p-2 border rounded-lg relative
                          ${
                            day.isCurrentMonth
                              ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                              : "bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700"
                          }
                          ${
                            day.isToday
                              ? "ring-2 ring-primary ring-opacity-50"
                              : ""
                          }
                        `}
                      >
                        <div
                          className={`
                          text-sm font-medium mb-1
                          ${
                            day.isCurrentMonth
                              ? "text-slate-900 dark:text-slate-100"
                              : "text-slate-400 dark:text-slate-500"
                          }
                          ${day.isToday ? "text-primary font-bold" : ""}
                        `}
                        >
                          {day.date.getDate()}
                        </div>

                        {day.shifts.length > 0 && (
                          <div className="space-y-1">
                            {day.shifts.slice(0, 2).map((shift, shiftIndex) => (
                              <div
                                key={shiftIndex}
                                className="text-xs p-1 bg-green-300 text-primary rounded border border-primary/20 truncate"
                                title={`${formatTime(
                                  shift.startTime
                                )} - ${formatTime(shift.endTime)}${
                                  shift.shiftNote ? ` (${shift.shiftNote})` : ""
                                }`}
                              >
                                {formatTime(shift.startTime)} -{" "}
                                {formatTime(shift.endTime)}
                              </div>
                            ))}
                            {day.shifts.length > 2 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                +{day.shifts.length - 2} more
                              </div>
                            )}
                            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              {calculateDayHours(day.shifts).toFixed(1)}h
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Monthly Summary */}
                  {Array.isArray(monthlyShifts) && monthlyShifts.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Monthly Summary for{" "}
                        {calendarDate.toLocaleDateString("en-gb", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">
                            Total Shifts:
                          </span>
                          <span className="font-semibold ml-2 text-slate-900 dark:text-slate-100">
                            {monthlyShifts.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">
                            Total Hours:
                          </span>
                          <span className="font-semibold ml-2 text-slate-900 dark:text-slate-100">
                            {calculateDayHours(monthlyShifts).toFixed(1)}h
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">
                            Avg per Shift:
                          </span>
                          <span className="font-semibold ml-2 text-slate-900 dark:text-slate-100">
                            {monthlyShifts.length > 0
                              ? (
                                  calculateDayHours(monthlyShifts) /
                                  monthlyShifts.length
                                ).toFixed(1)
                              : 0}
                            h
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">
                            Days Worked:
                          </span>
                          <span className="font-semibold ml-2 text-slate-900 dark:text-slate-100">
                            {new Set(monthlyShifts.map((s) => s.date)).size}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Actions */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Schedule Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => onNavigate("./requests/create")}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <FileText className="h-4 w-4 mr-2" />
              Request Time Off
            </Button>
            <Button
              onClick={() => onNavigate("./requests")}
              variant="outline"
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              View My Requests
            </Button>
           
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffRostersView;
