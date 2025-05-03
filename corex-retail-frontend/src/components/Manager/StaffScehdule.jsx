import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCircle2,
  RotateCcw,
  Loader2,
  Calendar,
  AlarmClock,
  AlertCircle,
} from "lucide-react";
import { useRoster } from "../../configs/RostersContext";

const StaffSchedule = ({ staffId }) => {
  const {
    shifts,
    selectedDate,
    changeSelectedDate,
    fetchShiftsForDate,
    loading,
    error,
    // For individual staff member shifts
    fetchUpcomingShifts,
    upcomingShifts,
    upcomingLoading,
    upcomingError,
    getFormattedUpcomingShifts,
  } = useRoster();

  const [currentWeek, setCurrentWeek] = useState("This Week");
  const [weekDates, setWeekDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [individualMode, setIndividualMode] = useState(false);

  useEffect(() => {
    if (staffId) {
      setIndividualMode(true);
      fetchUpcomingShifts(staffId, 14);
    } else {
      setIndividualMode(false);
    }
  }, [staffId, fetchUpcomingShifts]);

  const generateWeekDates = (referenceDate) => {
    const startDate = new Date(referenceDate);
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
    setWeekDates(generateWeekDates(selectedDate));
  }, [selectedDate]);

  // Initialize with current week
  useEffect(() => {
    setWeekDates(generateWeekDates(new Date()));
  }, []);

  // Log shifts for debugging
  useEffect(() => {
    if (shifts.length > 0) {
      console.log("📋 Loaded shifts:", shifts);
    }
  }, [shifts]);

  // Get all upcoming shifts for the individual staff member
  const formattedUpcomingShifts = useMemo(() => {
    if (individualMode) {
      return getFormattedUpcomingShifts();
    }
    return [];
  }, [individualMode, getFormattedUpcomingShifts]);

  // Filter shifts for the selected day
  const filteredShifts = useMemo(() => {
    // Find the date object for the selected day
    const selectedObj = weekDates.find((wd) => wd.day === selectedDay);
    if (!selectedObj) return [];

    // Get date string in ISO format
    const selectedFullDate = selectedObj.fullDate.toISOString().split("T")[0];

    if (individualMode && formattedUpcomingShifts.length > 0) {
      // Find shifts for this day in the upcoming shifts data
      const dayData = formattedUpcomingShifts.find(
        (day) => day.date === selectedFullDate
      );
      return dayData ? dayData.shifts : [];
    } else {
      // Filter all shifts for this date (if no specific staff selected)
      const filtered = shifts.filter((shift) => {
        if (staffId) {
          // If staffId is provided, only include shifts for this staff member
          const shiftEmployeeId =
            typeof shift.employeeId === "string"
              ? shift.employeeId
              : shift.employeeId?.uid;

          return shiftEmployeeId === staffId && shift.date === selectedFullDate;
        }

        // Otherwise include all shifts for this date
        const shiftDate = shift.date.split("T")[0]; // in case it's full ISO
        return shiftDate === selectedFullDate;
      });

      return filtered;
    }
  }, [
    shifts,
    selectedDay,
    weekDates,
    staffId,
    individualMode,
    formattedUpcomingShifts,
  ]);

  // Navigate between weeks
  const navigateWeek = (direction) => {
    let newDate;
    const currentDateObj = new Date(selectedDate);

    if (direction === "prev") {
      newDate =
        currentWeek === "This Week"
          ? new Date(currentDateObj.setDate(currentDateObj.getDate() - 7))
          : currentWeek === "Next Week"
          ? currentDateObj
          : new Date(currentDateObj.setDate(currentDateObj.getDate() + 7));

      setCurrentWeek((prevWeek) =>
        prevWeek === "This Week"
          ? "Last Week"
          : prevWeek === "Next Week"
          ? "This Week"
          : "Next Week"
      );
    } else {
      newDate =
        currentWeek === "This Week"
          ? new Date(currentDateObj.setDate(currentDateObj.getDate() + 7))
          : currentWeek === "Last Week"
          ? currentDateObj
          : new Date(currentDateObj.setDate(currentDateObj.getDate() - 7));

      setCurrentWeek((prevWeek) =>
        prevWeek === "This Week"
          ? "Next Week"
          : prevWeek === "Last Week"
          ? "This Week"
          : "Last Week"
      );
    }

    changeSelectedDate(newDate);
  };

  // Get appropriate styling for the shift based on its status
  const getShiftStyle = (shift) => {
    const now = new Date();
    const shiftDate = new Date(shift.date);
    const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
    const shiftEnd = new Date(`${shift.date}T${shift.endTime}`);

    // If shift is in the past
    if (shiftDate < now && !isSameDay(shiftDate, now)) {
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        status: "Completed",
      };
    }

    // If shift is currently happening
    if (now >= shiftStart && now <= shiftEnd) {
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        status: "In Progress",
      };
    }

    // If shift is today but not started yet
    if (isSameDay(shiftDate, now) && now < shiftStart) {
      return {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        status: "Today",
      };
    }

    // Future shift
    return {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      status: "Scheduled",
    };
  };

  // Refresh the schedule data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (individualMode) {
        await fetchUpcomingShifts(staffId, 14);
      } else {
        const selectedObj = weekDates.find((wd) => wd.day === selectedDay);
        if (selectedObj) {
          await fetchShiftsForDate(selectedObj.fullDate);
        }
      }
    } catch (error) {
      console.error("Error refreshing schedule:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    changeSelectedDate(today);
    setSelectedDay(today.toLocaleDateString("en-US", { weekday: "long" }));
  };

  // Format time for display
  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if a day has shifts
  const dayHasShifts = (fullDate) => {
    if (!individualMode || formattedUpcomingShifts.length === 0) {
      return false;
    }

    const dateStr = fullDate.toISOString().split("T")[0];
    return formattedUpcomingShifts.some((day) => day.date === dateStr);
  };

  // Loading state
  const isLoading = loading || upcomingLoading || isRefreshing;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Week Navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Weekly Schedule</h2>
            <p className="text-sm text-gray-500">
              {individualMode
                ? "View staff member's schedule"
                : "View and manage staff schedules"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <select
              value={currentWeek}
              onChange={(e) => {
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
                changeSelectedDate(newDate);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="Last Week">Last Week</option>
              <option value="This Week">This Week</option>
              <option value="Next Week">Next Week</option>
            </select>

            <button
              onClick={() => navigateWeek("next")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>

            <button
              onClick={handleRefresh}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                isRefreshing ? "opacity-50" : ""
              }`}
              disabled={isLoading}
              title="Refresh schedule"
            >
              <RotateCcw
                className={`h-5 w-5 text-gray-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center mb-4">
          <button
            onClick={goToToday}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Today</span>
          </button>
        </div>

        <div className="flex space-x-1 overflow-x-auto pb-2 hide-scrollbar">
          {weekDates.map(({ day, date, month, fullDate, isToday }) => {
            const isSelected = selectedDay === day;
            const hasShifts = dayHasShifts(fullDate);

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  const clickedDate = weekDates.find((d) => d.day === day);
                  if (clickedDate) {
                    changeSelectedDate(clickedDate.fullDate);
                    if (!individualMode) {
                      fetchShiftsForDate(clickedDate.fullDate);
                    }
                  }
                }}
                className={`flex-1 min-w-[4rem] p-2 rounded-lg transition-colors relative ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : isToday
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium flex items-center gap-1">
                    {day.substring(0, 3)}
                  </span>
                  <span className="text-xs mt-1">
                    {date} {month}
                  </span>
                  {hasShifts && !isSelected && (
                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shifts Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
            <p>Loading schedule...</p>
          </div>
        ) : error || upcomingError ? (
          <div className="flex flex-col items-center justify-center text-red-500 py-12">
            <AlertCircle className="h-10 w-10 mb-4" />
            <p className="text-center">{error || upcomingError}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-12">
            <Calendar className="h-12 w-12 text-gray-300 mb-4" />
            <p className="font-medium">No shifts scheduled</p>
            <p className="text-sm mt-1">
              {individualMode
                ? "This staff member doesn't have any shifts scheduled for this day"
                : "No shifts scheduled for " + selectedDay}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShifts.map((shift) => {
              const { bgColor, textColor, status } = getShiftStyle(shift);
              return (
                <div
                  key={shift.id}
                  className={`${bgColor} border border-gray-200 rounded-2xl p-4 flex justify-between items-center hover:shadow-md transition-shadow duration-300`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-full">
                      {status === "In Progress" ? (
                        <AlarmClock className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      {shift.employeeId.profilePicture ? (
                        <img
                          src={shift.employeeId.profilePicture}
                          alt={shift.employeeId.username}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <UserCircle2 className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 capitalize">
                        {individualMode
                          ? "Scheduled Shift"
                          : shift.employeeId.username || "Staff Member"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shift.notes ||
                          shift.shiftNote ||
                          "No additional notes"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {formatTime(shift.startTime)} -{" "}
                        {formatTime(shift.endTime)}
                      </span>
                    </div>
                    <div
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${textColor}`}
                    >
                      {status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffSchedule;
