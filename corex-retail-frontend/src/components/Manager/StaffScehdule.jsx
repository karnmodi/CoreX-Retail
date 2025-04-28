import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCircle2,
  RotateCcw,
} from "lucide-react";
import { useRoster } from "../../configs/RostersContext";

const StaffSchedule = () => {
  const {
    shifts,
    selectedDate,
    changeSelectedDate,
    fetchShiftsForDate,
    loading,
    error,
  } = useRoster();

  const [currentWeek, setCurrentWeek] = useState("This Week");
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
      };
    });
  };

  useEffect(() => {
    setWeekDates(generateWeekDates(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    setWeekDates(generateWeekDates(new Date()));
  }, []);

  useEffect(() => {
    if (shifts.length > 0) {
      console.log("📋 Loaded shifts:", shifts);
    }
  }, [shifts]);

  const filteredShifts = useMemo(() => {
    const selectedObj = weekDates.find((wd) => wd.day === selectedDay);
    if (!selectedObj) return [];

    const selectedFullDate = selectedObj.fullDate.toISOString().split("T")[0];

    const filtered = shifts.filter((shift) => {
      const shiftDate = shift.date.split("T")[0]; // in case it's full ISO
      return shiftDate === selectedFullDate;
    });

    return filtered;
  }, [shifts, selectedDay, weekDates]);

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

  const getShiftStyle = (shift) => {
    const now = new Date();
    const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
    const shiftEnd = new Date(`${shift.date}T${shift.endTime}`);

    if (now > shiftEnd) {
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        status: "Completed",
      };
    }

    if (now >= shiftStart && now <= shiftEnd) {
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        status: "In Progress",
      };
    }

    return {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      status: "Scheduled",
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Week Navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Weekly Schedule</h2>
            <p className="text-sm text-gray-500">
              View and manage staff schedules
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
            >
              <option value="Last Week">Last Week</option>
              <option value="This Week">This Week</option>
              <option value="Next Week">Next Week</option>
            </select>
            <button
              onClick={() => navigateWeek("next")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex space-x-1">
          {weekDates.map(({ day, date, month }) => {
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  const clickedDate = weekDates.find((d) => d.day === day);
                  if (clickedDate) {
                    changeSelectedDate(clickedDate.fullDate);
                    fetchShiftsForDate(clickedDate.fullDate);
                  }
                }}
                className={`flex-1 p-2 rounded-lg transition-colors relative ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium flex items-center gap-1">
                    {day.substring(0, 3)}
                    {isSelected && (
                      <RotateCcw
                        className="h-3.5 w-3.5 cursor-pointer hover:text-white/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          const clickedDate = weekDates.find(
                            (d) => d.day === day
                          );
                          if (clickedDate) {
                            changeSelectedDate(clickedDate.fullDate);
                            fetchShiftsForDate(clickedDate.fullDate);
                          }
                        }}
                      />
                    )}
                  </span>
                  <span className="text-xs mt-1">
                    {date} {month}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shifts Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-500 py-4">
            Loading shifts...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : filteredShifts.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No shifts scheduled for {selectedDay}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShifts.map((shift) => {
              const { bgColor, textColor, status } = getShiftStyle(shift);
              return (
                <div
                  key={shift.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <UserCircle2 className="h-10 w-10 text-gray-400" />
                    <div>
                      <div className="font-semibold text-gray-800 capitalize">
                        {shift.employeeId.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shift.shiftNote || "No additional notes"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {new Date(
                          `1970-01-01T${shift.startTime}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -
                        {new Date(
                          `1970-01-01T${shift.endTime}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${bgColor} ${textColor}`}
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
