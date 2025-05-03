import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  User,
  RotateCcw,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useRoster } from "../../configs/RostersContext";
import { useAuth } from "../../configs/AuthContext";

const StaffScheduleViewer = ({ staffId }) => {
  const {
    fetchUpcomingShifts,
    upcomingShifts,
    upcomingLoading,
    upcomingError,
    getFormattedUpcomingShifts
  } = useRoster();
  
  const { currentUser } = useAuth();
  
  // Use provided staffId or fall back to current user
  const userIdToFetch = staffId || (currentUser?.uid);
  
  const [currentView, setCurrentView] = useState("week");
  const [lookAheadDays, setLookAheadDays] = useState(14);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" })
  );

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
        isToday: isSameDay(date, new Date())
      };
    });
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  useEffect(() => {
    if (userIdToFetch) {
      fetchUpcomingShifts(userIdToFetch, lookAheadDays);
    }
  }, [userIdToFetch, lookAheadDays, fetchUpcomingShifts]);

  useEffect(() => {
    setWeekDates(generateWeekDates(selectedDate));
  }, [selectedDate]);

  const formattedShifts = useMemo(() => {
    return getFormattedUpcomingShifts();
  }, [getFormattedUpcomingShifts]);

  const selectedDayShifts = useMemo(() => {
    const selectedDateObj = weekDates.find(date => date.day === selectedDay);
    if (!selectedDateObj) return [];
    
    const formattedDateStr = selectedDateObj.fullDate.toISOString().split('T')[0];
    
    const dayData = formattedShifts.find(day => day.date === formattedDateStr);
    return dayData ? dayData.shifts : [];
  }, [weekDates, selectedDay, formattedShifts]);

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };

  // Handle extended view (fetch more days)
  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === "month") {
      setLookAheadDays(30);
      fetchUpcomingShifts(userIdToFetch, 30);
    } else {
      setLookAheadDays(14);
      fetchUpcomingShifts(userIdToFetch, 14);
    }
  };

  const getShiftStyle = (shift) => {
    const now = new Date();
    const shiftDate = new Date(shift.date);
    const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
    const shiftEnd = new Date(`${shift.date}T${shift.endTime}`);

    if (shiftDate < now && shiftDate.getDate() !== now.getDate()) {
      return {
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200",
        textColor: "text-gray-600",
        status: "Past"
      };
    }

    // If shift is currently happening
    if (now >= shiftStart && now <= shiftEnd) {
      return {
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        status: "Current"
      };
    }

    // If shift is today but not started
    if (isSameDay(shiftDate, now) && now < shiftStart) {
      return {
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-800",
        status: "Today"
      };
    }

    // Future shift
    return {
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      status: "Upcoming"
    };
  };

  // Calculate shift duration in hours
  const calculateShiftDuration = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diff = end - start;
    return Math.round((diff / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setSelectedDay(today.toLocaleDateString("en-US", { weekday: "long" }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header with navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">My Schedule</h2>
            <p className="text-sm text-gray-500">
              View your upcoming shifts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewChange("week")}
              className={`px-3 py-1.5 rounded-md text-sm ${
                currentView === "week"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => handleViewChange("month")}
              className={`px-3 py-1.5 rounded-md text-sm ${
                currentView === "month"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Month View
            </button>
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => navigateWeek("prev")}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Today</span>
          </button>
          
          <button
            onClick={() => navigateWeek("next")}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day selector */}
        <div className="flex space-x-1 overflow-x-auto pb-2 hide-scrollbar">
          {weekDates.map(({ day, date, month, fullDate, isToday }) => {
            const isSelected = selectedDay === day;
            const hasShift = formattedShifts.some(shift => 
              isSameDay(new Date(shift.date), fullDate)
            );

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                }}
                className={`flex-1 min-w-[4rem] p-2 rounded-lg transition-colors relative ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : isToday
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium">
                    {day.substring(0, 3)}
                  </span>
                  <span className="text-xs mt-1">
                    {date} {month}
                  </span>
                  {hasShift && !isSelected && (
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
        {upcomingLoading ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-10">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
            <p>Loading your schedule...</p>
          </div>
        ) : upcomingError ? (
          <div className="flex flex-col items-center justify-center text-red-500 py-10">
            <AlertCircle className="h-10 w-10 mb-4" />
            <p className="font-medium">{upcomingError}</p>
            <button 
              onClick={() => fetchUpcomingShifts(userIdToFetch, lookAheadDays)}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : selectedDayShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-10">
            <Calendar className="h-10 w-10 text-gray-300 mb-4" />
            <p className="font-medium">No shifts scheduled</p>
            <p className="text-sm mt-1">
              You don't have any shifts scheduled for {selectedDay}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDayShifts.map((shift) => {
              const { bgColor, borderColor, textColor, status } = getShiftStyle(shift);
              const hours = calculateShiftDuration(shift.startTime, shift.endTime);
              
              return (
                <div
                  key={shift.id}
                  className={`border ${borderColor} ${bgColor} rounded-lg p-4 hover:shadow-md transition-shadow duration-300`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-full">
                        <Clock className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {new Date(`1970-01-01T${shift.startTime}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}{" "}
                          -{" "}
                          {new Date(`1970-01-01T${shift.endTime}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {hours} hour{hours !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-xs ${textColor} px-2.5 py-1 rounded-full`}
                    >
                      {status}
                    </div>
                  </div>
                  
                  {shift.notes && (
                    <div className="mt-3 ml-10 text-sm text-gray-600 border-t border-gray-200 pt-2">
                      {shift.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {formattedShifts.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Schedule Summary</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500">Total Shifts</div>
              <div className="text-xl font-bold text-gray-800 mt-1">
                {formattedShifts.reduce((total, day) => total + day.totalShifts, 0)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500">Days Scheduled</div>
              <div className="text-xl font-bold text-gray-800 mt-1">
                {formattedShifts.length}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500">Total Hours</div>
              <div className="text-xl font-bold text-gray-800 mt-1">
                {formattedShifts.reduce((total, day) => total + day.totalHours, 0).toFixed(1)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500">Days Ahead</div>
              <div className="text-xl font-bold text-gray-800 mt-1">
                {lookAheadDays}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffScheduleViewer;