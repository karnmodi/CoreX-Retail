import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Loader2,
  Calendar,
  AlarmClock,
  AlertCircle,
  CalendarDays,
  MapPin,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoster } from "../../configs/RostersContext";
import { useAuth } from "../../configs/AuthContext";

const StaffPersonalSchedule = ({ onNavigate }) => {
  const { user } = useAuth();
  const {
    fetchUpcomingShifts,
    upcomingShifts,
    upcomingLoading,
    upcomingError,
    getFormattedUpcomingShifts,
    fetchMonthlyShifts,
    changeSelectedDate,
    selectedDate,
  } = useRoster();

  const [currentWeek, setCurrentWeek] = useState("This Week");
  const [weekDates, setWeekDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localSelectedDate, setLocalSelectedDate] = useState(new Date());
  const [allShiftsData, setAllShiftsData] = useState({}); // Store shifts for multiple time periods

  // Initialize and fetch shifts for the current user
  useEffect(() => {
    if (user && user.uid) {
      console.log("Fetching initial shifts for staff member:", user.uid);
      // Fetch upcoming shifts (covers current and future dates)
      fetchUpcomingShifts(user.uid, 30);

      // Also fetch current month to ensure we have current data
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      fetchMonthlyShifts(currentMonth, currentYear);
    }
  }, [user, fetchUpcomingShifts, fetchMonthlyShifts]);

  const generateWeekDates = (referenceDate) => {
    const startDate = new Date(referenceDate);
    // Set to Monday of the week
    startDate.setDate(
      startDate.getDate() -
        startDate.getDay() +
        (startDate.getDay() === 0 ? -6 : 1)
    );

    return [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return {
        day,
        date: date.getDate(),
        month: date.toLocaleString("default", { month: "short" }),
        fullDate: date,
        isToday: isSameDay(date, new Date()),
      };
    });
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Update week dates when selected date changes
  useEffect(() => {
    setWeekDates(generateWeekDates(localSelectedDate));
  }, [localSelectedDate]);

  // Initialize with current week
  useEffect(() => {
    const today = new Date();
    setWeekDates(generateWeekDates(today));
    setLocalSelectedDate(today);
  }, []);

  // Get all upcoming shifts for the staff member
  const formattedUpcomingShifts = useMemo(() => {
    console.log("Getting formatted upcoming shifts:", upcomingShifts);
    if (!upcomingShifts?.shiftsByDate) {
      return [];
    }

    return Object.entries(upcomingShifts.shiftsByDate).map(([date, shifts]) => {
      // Format the date for display
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Calculate total hours for the day
      const totalHours = shifts.reduce((total, shift) => {
        const startTime = new Date(`${date}T${shift.startTime}`);
        const endTime = new Date(`${date}T${shift.endTime}`);
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        return total + hours;
      }, 0);

      return {
        date,
        formattedDate,
        shifts,
        totalHours: Math.round(totalHours * 10) / 10,
        totalShifts: shifts.length,
      };
    });
  }, [upcomingShifts]);

  // Combine upcoming shifts and monthly shifts for comprehensive data
  const combinedShiftsData = useMemo(() => {
    const combined = {};

    // Add upcoming shifts data
    if (upcomingShifts?.shiftsByDate) {
      Object.entries(upcomingShifts.shiftsByDate).forEach(([date, shifts]) => {
        combined[date] = shifts;
      });
    }

    // Add any additional shifts from allShiftsData (from monthly fetches)
    Object.entries(allShiftsData).forEach(([date, shifts]) => {
      if (!combined[date]) {
        combined[date] = shifts;
      }
    });

    return combined;
  }, [upcomingShifts, allShiftsData]);

  // Filter shifts for the selected day
  const filteredShifts = useMemo(() => {
    // Find the date object for the selected day
    const selectedObj = weekDates.find((wd) => wd.day === selectedDay);
    if (!selectedObj) return [];

    // Get date string in ISO format
    const selectedFullDate = selectedObj.fullDate.toISOString().split("T")[0];

    console.log("Filtering shifts for date:", selectedFullDate);
    console.log("Available combined shifts data:", combinedShiftsData);

    // Look for shifts in combined data
    const shiftsForDay = combinedShiftsData[selectedFullDate] || [];
    console.log("Shifts found for day:", shiftsForDay);

    return shiftsForDay;
  }, [selectedDay, weekDates, combinedShiftsData]);

  // Navigate between weeks
  const navigateWeek = async (direction) => {
    let newDate;
    const currentDateObj = new Date(localSelectedDate);

    if (direction === "prev") {
      newDate = new Date(currentDateObj.setDate(currentDateObj.getDate() - 7));
      setCurrentWeek((prevWeek) =>
        prevWeek === "This Week"
          ? "Last Week"
          : prevWeek === "Next Week"
          ? "This Week"
          : "Next Week"
      );
    } else {
      newDate = new Date(currentDateObj.setDate(currentDateObj.getDate() + 7));
      setCurrentWeek((prevWeek) =>
        prevWeek === "This Week"
          ? "Next Week"
          : prevWeek === "Last Week"
          ? "This Week"
          : "Last Week"
      );
    }

    setLocalSelectedDate(newDate);
    changeSelectedDate(newDate);

    // Fetch data for the new week
    await fetchDataForWeek(newDate);
  };

  // Fetch data for a specific week
  const fetchDataForWeek = async (weekDate) => {
    if (!user?.uid) return;

    try {
      const today = new Date();
      const weekStart = new Date(weekDate);
      weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Monday

      // If the week contains today or is in the future, use upcoming shifts
      if (weekDate >= today || weekStart <= today) {
        console.log("Fetching upcoming shifts for week containing:", weekDate);
        await fetchUpcomingShifts(user.uid, 45); // Extended range
      }

      // For past weeks or to ensure complete data, fetch monthly data
      const monthsToFetch = new Set();

      // Add the month of the week start
      monthsToFetch.add({
        month: weekStart.getMonth() + 1,
        year: weekStart.getFullYear(),
      });

      // Add the month of the week end (in case week spans two months)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      monthsToFetch.add({
        month: weekEnd.getMonth() + 1,
        year: weekEnd.getFullYear(),
      });

      // Fetch monthly data for each unique month
      for (const { month, year } of monthsToFetch) {
        console.log(`Fetching monthly data for ${month}/${year}`);
        try {
          const monthlyData = await fetchMonthlyShifts(month, year);
          if (monthlyData?.shifts) {
            // Convert monthly shifts to the same format as upcoming shifts
            const monthlyShiftsFormatted = {};
            monthlyData.shifts.forEach((shift) => {
              const dateKey = shift.date;
              if (!monthlyShiftsFormatted[dateKey]) {
                monthlyShiftsFormatted[dateKey] = [];
              }
              monthlyShiftsFormatted[dateKey].push(shift);
            });

            // Merge with existing data
            setAllShiftsData((prev) => ({
              ...prev,
              ...monthlyShiftsFormatted,
            }));
          }
        } catch (error) {
          console.error(
            `Error fetching monthly data for ${month}/${year}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error fetching data for week:", error);
    }
  };

  // Get appropriate styling for the shift based on its status
  const getShiftStyle = (shift) => {
    const now = new Date();
    const selectedObj = weekDates.find((wd) => wd.day === selectedDay);
    if (!selectedObj)
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        status: "Scheduled",
      };

    const shiftDate = selectedObj.fullDate;
    const shiftStart = new Date(
      `${selectedObj.fullDate.toISOString().split("T")[0]}T${shift.startTime}`
    );
    const shiftEnd = new Date(
      `${selectedObj.fullDate.toISOString().split("T")[0]}T${shift.endTime}`
    );

    // If shift is in the past
    if (shiftDate < now && !isSameDay(shiftDate, now)) {
      return {
        bgColor: "bg-gray-100 dark:bg-gray-800",
        textColor: "text-gray-600 dark:text-gray-400",
        status: "Completed",
        borderColor: "border-gray-200 dark:border-gray-700",
      };
    }

    // If shift is currently happening
    if (now >= shiftStart && now <= shiftEnd) {
      return {
        bgColor: "bg-green-100 dark:bg-green-900/20",
        textColor: "text-green-800 dark:text-green-200",
        status: "In Progress",
        borderColor: "border-green-200 dark:border-green-700",
      };
    }

    // If shift is today but not started yet
    if (isSameDay(shiftDate, now) && now < shiftStart) {
      return {
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        textColor: "text-yellow-800 dark:text-yellow-200",
        status: "Today",
        borderColor: "border-yellow-200 dark:border-yellow-700",
      };
    }

    // Future shift
    return {
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-800 dark:text-blue-200",
      status: "Scheduled",
      borderColor: "border-blue-200 dark:border-blue-700",
    };
  };

  // Refresh the schedule data
  const handleRefresh = async () => {
    if (!user?.uid) return;

    setIsRefreshing(true);
    try {
      // Refresh both upcoming shifts and current week data
      await fetchUpcomingShifts(user.uid, 45);
      await fetchDataForWeek(localSelectedDate);
    } catch (error) {
      console.error("Error refreshing schedule:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Go to today
  const goToToday = async () => {
    const today = new Date();
    setLocalSelectedDate(today);
    changeSelectedDate(today);
    setSelectedDay(today.toLocaleDateString("en-US", { weekday: "long" }));
    setCurrentWeek("This Week");

    // Fetch current week data
    await fetchDataForWeek(today);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if a day has shifts
  const dayHasShifts = (fullDate) => {
    const dateStr = fullDate.toISOString().split("T")[0];
    return !!combinedShiftsData[dateStr]?.length;
  };

  // Calculate total hours for selected day
  const calculateDayHours = () => {
    return filteredShifts.reduce((total, shift) => {
      if (!shift.startTime || !shift.endTime) return total;
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      return total + (end - start) / (1000 * 60 * 60);
    }, 0);
  };

  // Loading state
  const isLoading = upcomingLoading || isRefreshing;

  return (
    <Card className="bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            My Weekly Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RotateCcw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Week Navigation */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("prev")}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <select
                value={currentWeek}
                onChange={async (e) => {
                  setCurrentWeek(e.target.value);
                  const today = new Date();
                  let newDate;
                  switch (e.target.value) {
                    case "Last Week":
                      newDate = new Date(today.setDate(today.getDate() - 7));
                      break;
                    case "Next Week":
                      newDate = new Date(today.setDate(today.getDate() + 7));
                      break;
                    default:
                      newDate = today;
                  }
                  setLocalSelectedDate(newDate);
                  changeSelectedDate(newDate);

                  // Fetch data for the selected week
                  await fetchDataForWeek(newDate);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700"
                disabled={isLoading}
              >
                <option value="Last Week">Last Week</option>
                <option value="This Week">This Week</option>
                <option value="Next Week">Next Week</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("next")}
                disabled={isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Today</span>
            </Button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDates.map(({ day, date, month, fullDate, isToday }) => {
              const isSelected = selectedDay === day;
              const hasShifts = dayHasShifts(fullDate);

              return (
                <Button
                  key={day}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  disabled={isLoading}
                  className={`flex flex-col items-center p-3 h-auto relative ${
                    isToday && !isSelected
                      ? "border-primary bg-primary/5 hover:bg-primary/10"
                      : ""
                  }`}
                >
                  <span className="text-xs font-medium">
                    {day.substring(0, 3)}
                  </span>
                  <span className="text-xs mt-1">
                    {date} {month}
                  </span>
                  {hasShifts && !isSelected && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"></div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Header */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {selectedDay},{" "}
              {weekDates.find((d) => d.day === selectedDay)?.date}{" "}
              {weekDates.find((d) => d.day === selectedDay)?.month}
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {filteredShifts.length} shift
              {filteredShifts.length !== 1 ? "s" : ""} •{" "}
              {calculateDayHours().toFixed(1)}h total
            </div>
          </div>
        </div>

        {/* Shifts Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Loading schedule...</p>
          </div>
        ) : upcomingError ? (
          <div className="flex flex-col items-center justify-center text-red-500 py-12">
            <AlertCircle className="h-10 w-10 mb-4" />
            <p className="text-center mb-4">{upcomingError}</p>
            <Button variant="outline" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-12">
            <Calendar className="h-12 w-12 text-slate-300 mb-4" />
            <h4 className="font-medium mb-2">No shifts scheduled</h4>
            <p className="text-sm text-center mb-6">
              You don't have any shifts scheduled for {selectedDay}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("./requests/create")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Request Time Off
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShifts.map((shift, index) => {
              const { bgColor, textColor, status, borderColor } =
                getShiftStyle(shift);
              return (
                <div
                  key={shift.id || index}
                  className={`${bgColor} ${borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                        {status === "In Progress" ? (
                          <AlarmClock className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          Work Shift
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {shift.notes || shift.shiftNote || "Regular shift"}
                        </p>
                        {shift.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{shift.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {formatTime(shift.startTime)} -{" "}
                          {formatTime(shift.endTime)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${textColor} text-xs`}
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-primary/90"
            onClick={() => onNavigate("./requests/create")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Request Time Off
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffPersonalSchedule;
