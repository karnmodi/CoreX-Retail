import React, { useState, useEffect } from "react";
import { useRoster } from "@/configs/RostersContext";
import { format, addDays, subDays } from "date-fns";
import FloatingLabelInput from "../../components/small/FloatingLabelInput";
import {
  Pencil,
  Trash2,
  ArrowBigRight,
  ArrowBigLeft,
  BadgePlus,
  Save,
  CircleX,
  Printer,
  Calendar1,
} from "lucide-react";

const RosterManagementPage = () => {
  const {
    employees,
    shifts,
    selectedDate,
    businessHours,
    loading,
    getEmployeeWorkingOnDate,
    changeSelectedDate,
    addShift,
    updateShift,
    deleteShift,
  } = useRoster();

  useEffect(() => {
    console.log("Current shifts in component:", shifts);
  }, [shifts]);

  const [shiftForm, setShiftForm] = useState({
    employeeId: "",
    startTime: businessHours.startTime,
    endTime: businessHours.endTime,
    notes: "",
  });

  const [editingShift, setEditingShift] = useState(null);

  // Generate time slots for the day view
  const generateTimeSlots = () => {
    const slots = [];
    const [startHour, startMinute] = businessHours.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = businessHours.endTime.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0);

    const interval = 30;

    for (
      let time = new Date(startTime);
      time < endTime;
      time.setMinutes(time.getMinutes() + interval)
    ) {
      slots.push(format(time, "HH:mm"));
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get employees working on the selected date
  const employeesWorking = getEmployeeWorkingOnDate(selectedDate);

  // Handle navigation between dates
  const handlePreviousDay = () => {
    changeSelectedDate(subDays(selectedDate, 1));
  };
  const handleToday = () => {
    changeSelectedDate(new Date());
  };

  const handleNextDay = () => {
    changeSelectedDate(addDays(selectedDate, 1));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const businessStart = businessHours.startTime || "09:00";
    const businessEnd = businessHours.endTime || "18:00";
    const ShiftDuration = businessHours.duration || 8;

    if (
      name === "startTime" &&
      (value < businessStart || value > businessEnd)
    ) {
      alert(
        `Start time must be within business hours (${businessStart} - ${businessEnd}).`
      );
      return;
    }

    let updatedShiftForm = { ...shiftForm, [name]: value };

    if (name === "startTime") {
      let [startHours, startMinutes] = value.split(":").map(Number);
      let endHours = startHours + ShiftDuration;
      let endMinutes = startMinutes;

      const [maxHours, maxMinutes] = businessEnd.split(":").map(Number);
      if (
        endHours > maxHours ||
        (endHours === maxHours && endMinutes > maxMinutes)
      ) {
        endHours = maxHours;
        endMinutes = maxMinutes;
      }

      const formattedEndTime = `${String(endHours).padStart(2, "0")}:${String(
        endMinutes
      ).padStart(2, "0")}`;
      updatedShiftForm.endTime = formattedEndTime;
    }

    setShiftForm(updatedShiftForm);
  };

  const handleAddShift = async (e) => {
    e.preventDefault();

    if (!shiftForm.employeeId || !shiftForm.startTime || !shiftForm.endTime) {
      alert("Please fill all fields");
      return;
    }

    const result = await addShift(
      shiftForm.employeeId,
      selectedDate,
      shiftForm.startTime,
      shiftForm.endTime,
      shiftForm.notes
    );

    if (result.success) {
      setShiftForm({
        employeeId: "",
        startTime: businessHours.startTime,
        endTime: businessHours.endTime,
        notes: "",
      });
      alert("Shift Added Successfully");
    } else {
      alert("Failed to add shift");
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift.id);
    setShiftForm({
      employeeId: shift.employeeId,
      startTime: shift.startTime,
      endTime: shift.endTime,
      notes: shift.notes,
    });
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();

    if (!editingShift || !shiftForm.startTime || !shiftForm.endTime) {
      alert("Invalid data");
      return;
    }

    const result = await updateShift(editingShift, {
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      notes: shiftForm.notes,
    });

    if (result.success) {
      setEditingShift(null);
      setShiftForm({
        employeeId: "",
        startTime: businessHours.startTime,
        endTime: businessHours.endTime,
        notes: "",
      });
      alert("Shift modified successfully");
    } else {
      alert("Failed to update shift");
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      setEditingShift(null);
      shiftForm.employeeId = "";
      shiftForm.startTime = businessHours.startTime;
      shiftForm.endTime = businessHours.endTime;
      shiftForm.notes = "";
      const result = await deleteShift(shiftId);
      if (alert.success) {
      }
      alert("Shift deleted successfully");

      if (!result.success) {
        alert("Failed to delete shift");
      }
    }
  };

  const handlePrintRoster = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print the roster");
      return;
    }

    // Calculate the current date and time for the timestamp
    const currentDateTime = new Date();
    const formattedDateTime = `${currentDateTime.toLocaleDateString()} ${currentDateTime.toLocaleTimeString()}`;

    const styles = `
      @page {
        size: A3 landscape;
        margin: 0.5cm;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      /* Critical for color printing */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .print-container {
        width: 100%;
        max-width: 29.7cm;
        margin: 0 auto;
      }
      .header {
        text-align: center;
        margin-bottom: 10px;
      }
      .page-title {
        font-size: 14px;
        color: #666;
        text-align: right;
        margin-bottom: 5px;
      }
      .roster-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .roster-date {
        font-size: 16px;
        margin-bottom: 15px;
      }
      .schedule-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-bottom: 20px;
      }
      .schedule-table th, .schedule-table td {
        border: 1px solid #ddd;
        padding: 0;
        text-align: center;
        height: 35px;
        font-size: 12px;
      }
      .schedule-table th {
        background-color: #f8f8f8;
        color: #333;
        font-weight: normal;
        padding: 5px 0;
      }
      .employee-col {
        text-align: left;
        font-weight: bold;
        width: 150px;
        padding-left: 10px !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .time-slot {
        width: 45px;
      }
      .shifts-col {
        width: 70px;
        text-align: right;
        padding-right: 10px !important;
      }
      .section-title {
        font-size: 18px;
        font-weight: bold;
        margin: 30px 0 10px 0;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }
      .staff-detail-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      .staff-detail-table th, .staff-detail-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
        font-size: 12px;
      }
      .staff-detail-table th {
        background-color: #f8f8f8;
        font-weight: bold;
      }
      .notes {
        font-style: italic;
        color: #666;
      }
      .footer {
        margin-top: 15px;
        font-size: 12px;
        color: #666;
      }
      .timestamp {
        font-size: 11px;
      }
      .about-blank {
        font-size: 10px;
        color: #999;
        position: absolute;
        bottom: 10px;
        left: 10px;
      }
      .page-number {
        font-size: 10px;
        color: #999;
        position: absolute;
        bottom: 10px;
        right: 10px;
      }
      /* Force background colors in printing */
      .shift-cell.colored {
        background-color: attr(data-color);
        border: 1px solid #999 !important;
      }
      .shift-pink { background-color: #ffcccc !important; }
      .shift-blue { background-color: #ccffff !important; }
      .shift-green { background-color: #ccffcc !important; }
      .shift-yellow { background-color: #ffffcc !important; }
      .shift-purple { background-color: #e6ccff !important; }
      
      @media print {
        .page-break {
          page-break-before: always;
        }
      }
    `;

    // Create a mapping of employee IDs to fixed colors for consistency
    const employeeColors = {
      // You can customize these colors or keep your existing system
      // This is a fallback in case your getRandomColor function doesn't work as expected in print
      0: "shift-pink",
      1: "shift-blue",
      2: "shift-green",
      3: "shift-yellow",
      4: "shift-purple",
    };

    // Get color mapping for each employee in case more are needed
    employeesWorking.forEach((employee, index) => {
      if (!employeeColors[employee.id]) {
        employeeColors[employee.id] = `shift-${
          ["pink", "blue", "green", "yellow", "purple"][index % 5]
        }`;
      }
    });

    const getEmployeeColorClass = (employeeId) => {
      return employeeColors[employeeId] || "shift-blue";
    };

    // Group shifts by employee for detail view
    const employeeShifts = {};
    employeesWorking.forEach((employee) => {
      const employeeId = employee.id;
      const employeeShiftList = shifts.filter(
        (shift) => shift.employeeId === employeeId
      );
      employeeShifts[employeeId] = employeeShiftList;
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Roster Schedule - ${format(
          selectedDate,
          "EEEE, MMMM d, yyyy"
        )}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <div class="roster-title">Daily Staff Roster</div>
            <div class="roster-date">${format(
              selectedDate,
              "EEEE, MMMM d, yyyy"
            )}</div>
          </div>
          
          <!-- Roster Graph (from right-hand side) -->
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="employee-col">Employee</th>
                ${timeSlots
                  .map(
                    (timeSlot) => `
                  <th class="time-slot">${timeSlot}</th>
                `
                  )
                  .join("")}
                <th class="shifts-col">Shifts</th>
              </tr>
            </thead>
            <tbody>
              ${
                employeesWorking.length > 0
                  ? employeesWorking
                      .map((employee, index) => {
                        const empShifts = shifts.filter(
                          (shift) => shift.employeeId === employee.id
                        );
                        const uniqueShifts = [
                          ...new Map(
                            empShifts.map((shift) => [
                              `${shift.startTime}-${shift.endTime}`,
                              shift,
                            ])
                          ).values(),
                        ];

                        return `
                    <tr>
                      <td class="employee-col">${getEmployeeName(
                        employee.id
                      )}</td>
                      ${timeSlots
                        .map((timeSlot) => {
                          const shift = findShiftForTimeSlot(
                            employee.id,
                            timeSlot
                          );
                          return shift
                            ? `<td class="shift-cell ${getEmployeeColorClass(
                                employee.id
                              )}"></td>`
                            : `<td></td>`;
                        })
                        .join("")}
                      <td class="shifts-col">
                        ${uniqueShifts
                          .map((shift) => {
                            const startHour = shift.startTime.split(":")[0];
                            const endHour = shift.endTime.split(":")[0];
                            return `${startHour} - ${endHour}`;
                          })
                          .join(" ")}
                      </td>
                    </tr>
                  `;
                      })
                      .join("")
                  : `<tr><td colspan="${
                      timeSlots.length + 2
                    }" style="text-align: center; padding: 20px;">No staff scheduled for this day.</td></tr>`
              }
            </tbody>
          </table>
          
          <!-- Staff Detail Table (from left-hand side) -->
          ${
            employeesWorking.length > 0
              ? `
          <div class="section-title">Staff Details</div>
          <table class="staff-detail-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Shift Time</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${employeesWorking
                .map((employee) => {
                  const empShiftList = employeeShifts[employee.id] || [];

                  return empShiftList
                    .map((shift, index) => {
                      return `
                    <tr>
                      ${
                        index === 0
                          ? `<td rowspan="${empShiftList.length}">${
                              employee.firstName
                            } ${employee.lastName}</td>
                         <td rowspan="${empShiftList.length}">${
                              employee.role || "Staff"
                            }</td>`
                          : ""
                      }
                      <td>${shift.startTime} - ${shift.endTime}</td>
                      <td class="notes">${shift.notes || ""}</td>
                    </tr>
                  `;
                    })
                    .join("");
                })
                .join("")}
            </tbody>
          </table>
          `
              : ""
          }
          
          <div class="footer">
            <div><strong>Business Hours:</strong> ${
              businessHours.startTime.split(":")[0]
            }:${businessHours.startTime.split(":")[1]} - ${
      businessHours.endTime.split(":")[0]
    }:${businessHours.endTime.split(":")[1]}</div>
            <div class="timestamp"><strong>Printed:</strong> ${formattedDateTime}</div>
          </div>
        </div>
        
        <div class="about-blank">about:blank</div>
        <div class="page-number">1/1</div>
        
        <script>
          window.onload = function() {
            // Add a small delay before printing to ensure styles are applied
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }, 200);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const findShiftForTimeSlot = (employeeId, timeSlot) => {
    return shifts.find((shift) => {
      if (shift.employeeId !== employeeId) return false;

      const [slotHour, slotMinute] = timeSlot.split(":").map(Number);
      const [startHour, startMinute] = shift.startTime.split(":").map(Number);
      const [endHour, endMinute] = shift.endTime.split(":").map(Number);

      const slotTime = new Date();
      slotTime.setHours(slotHour, slotMinute, 0);

      const startTime = new Date();
      startTime.setHours(startHour, startMinute, 0);

      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0);

      return slotTime >= startTime && slotTime < endTime;
    });
  };

  const getEmployeeName = (id) => {
    const employee = employees.find((emp) => emp.id === id);
    return employee
      ? `${
          employee.firstName.charAt(0).toUpperCase() +
          employee.firstName.slice(1).toLowerCase()
        } ${employee.lastName}`
      : "Unknown";
  };

  const getRandomColor = (employeeId) => {
    const colors = [
      "bg-red-100",
      "bg-red-300",
      "bg-red-600",
      "bg-green-100",
      "bg-green-300",
      "bg-green-600",
      "bg-yellow-100",
      "bg-yellow-300",
      "bg-yellow-600",
      "bg-purple-100",
      "bg-purple-300",
      "bg-purple-600",
      "bg-pink-100",
      "bg-pink-300",
      "bg-pink-600",
      "bg-indigo-100",
      "bg-indigo-300",
      "bg-indigo-600",
      "bg-teal-100",
      "bg-teal-300",
      "bg-teal-600",
      "bg-orange-100",
      "bg-orange-300",
      "bg-orange-600",
      "bg-blue-100",
      "bg-blue-300",
      "bg-blue-600",
      "bg-gray-100",
      "bg-gray-300",
      "bg-gray-600",
    ];

    // Simple hash function to generate a more distributed index
    const hash = employeeId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return colors[hash % colors.length]; // Better distribution
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container max-w-[1478px] p-4 rounded-lg">
      <h1 className="text-2xl font-bold mb-2">Roster Management</h1>

      <div className="flex flex-col md:flex-row gap-10 rounded-lg">
        {/* Staff Panel (Left) */}

        <div className="w-full md:w-1/4 bg-white rounded-2xl shadow-lg pl-4 pr-4 pb-4">
          {/* Add/Edit Shift Form */}
          <div className="mt-6 p-4 bg-white rounded shadow">
            <div className="flex justify-between">
              <h4 className="font-medium mb-3">
                {editingShift ? "Edit Shift" : "Add New Shift"}
              </h4>
            </div>
            <form onSubmit={editingShift ? handleUpdateShift : handleAddShift}>
              {!editingShift && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    name="employeeId"
                    value={shiftForm.employeeId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName.charAt(0).toUpperCase() +
                          employee.firstName.slice(1).toLowerCase()}{" "}
                        {employee.lastName} ({employee.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <FloatingLabelInput
                  label={"Start Time"}
                  type={"time"}
                  name="startTime"
                  value={shiftForm.startTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="09:00"
                  max="18:00"
                  required
                />
              </div>

              <div className="mb-4">
                <FloatingLabelInput
                  label={"End Time"}
                  type="time"
                  name="endTime"
                  value={shiftForm.endTime}
                  // onChange={handleInputChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>

              <div className="mb-4">
                <FloatingLabelInput
                  label={"Notes"}
                  type="input"
                  name="notes"
                  value={shiftForm.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-between">
                <button className="text-black-300 hover:text-black-700">
                  {editingShift ? (
                    <Save className="w-8 h-8" label="Update Shift" />
                  ) : (
                    <BadgePlus className="w-8 h-8" />
                  )}
                </button>

                {editingShift && (
                  <CircleX
                    className="w-8 h-8 cursor-pointer"
                    type="button"
                    onClick={() => {
                      setEditingShift(null);
                      setShiftForm({
                        employeeId: "",
                        startTime: businessHours.startTime,
                        endTime: businessHours.endTime,
                        notes: "",
                      });
                    }}
                  />
                )}
              </div>
            </form>
          </div>

          {/* Working Staffs Section */}
          <h3 className="text-lg font-semibold mb-4 mt-8">
            Staff Working Today
          </h3>

          {employeesWorking.length > 0 ? (
            <ul className="space-y-2">
              {employeesWorking.map((employee) => (
                <li key={employee.id} className="p-2 bg-white rounded shadow">
                  <div className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {shifts
                      .filter((shift) => shift.employeeId === employee.id)
                      .map((shift) => (
                        <div
                          key={shift.id}
                          className="flex justify-between items-center mt-1"
                        >
                          <span>
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <div className="flex gap-2">
                            <Pencil
                              onClick={() => handleEditShift(shift)}
                              className="text-blue-500 hover:text-blue-700 mr-2 text-sm"
                            />
                            <Trash2
                              onClick={() => handleDeleteShift(shift.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No staff scheduled for this day.</p>
          )}
        </div>

        {/* Day View Calendar (Right) */}
        <div className="w-full md:w-3/4 bg-gray-100 h-1/2 rounded-2xl shadow overflow-x-auto">
          <div className="max-w-screen-lg mx-auto flex sm:flex-row justify-between items-center gap-4 p-2 w-auto whitespace-nowrap sticky left-0 z-30 p-4">
            <ArrowBigLeft
              onClick={handlePreviousDay}
              className="cursor-pointer"
            />
            <b>
              <button
                onClick={handleToday}
                className="ml-2 bg-gray-100 hover:bg-gray-200 p-1 rounded-full"
                title="get Back to today"
              >
                <Calendar1 className="h-5 w-5" />
              </button>
              
              {" "}{format(selectedDate, "EEEE, MMMM d, yyyy")}{" "}
              <button
                onClick={handlePrintRoster}
                className="ml-2 bg-gray-100 hover:bg-gray-200 p-1 rounded-full"
                title="Print today's roster"
              >
                <Printer className="h-5 w-5" />
              </button>
            </b>

            <ArrowBigRight onClick={handleNextDay} className="cursor-pointer" />
          </div>

          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-2 border-b border-r whitespace-nowrap sticky left-0 bg-white z-30 shadow-md max-w-[100px]">
                  Employee
                </th>
                {timeSlots.map((timeSlot) => (
                  <th
                    key={timeSlot}
                    className="py-2 px-1 border-b min-w-[60px]"
                  >
                    {timeSlot}
                  </th>
                ))}
                <th className="py-2 px-2 border-b border-l whitespace-nowrap sticky right-0 bg-white z-20 shadow-md max-w-[120px]">
                  Shifts
                </th>
              </tr>
            </thead>
            <tbody>
              {employeesWorking.length > 0 || loading ? (
                employeesWorking.map((employee, index) => {
                  const allShifts = timeSlots
                    .map((timeSlot) =>
                      findShiftForTimeSlot(employee.id, timeSlot)
                    )
                    .filter((shift) => shift !== undefined && shift !== null);

                  const uniqueShifts = [
                    ...new Map(
                      allShifts.map((shift) => [
                        `${shift.startTime}-${shift.endTime}`,
                        shift,
                      ])
                    ).values(),
                  ];

                  return (
                    <tr
                      key={employee.id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-2 px-2 border-r font-medium whitespace-nowrap sticky left-0 bg-inherit z-30 text-sm max-w-[100px] truncate">
                        {getEmployeeName(employee.id)}
                      </td>

                      {timeSlots.map((timeSlot) => {
                        const shift = findShiftForTimeSlot(
                          employee.id,
                          timeSlot
                        );

                        return (
                          <td
                            key={timeSlot}
                            className={`py-2 px-1 cursor-pointer border-b min-w-[60px] ${
                              shift ? getRandomColor(employee.id) : ""
                            }`}
                            onClick={() => shift && handleEditShift(shift)}
                            onDoubleClick={() =>
                              shift && handleDeleteShift(shift.id)
                            }
                          ></td>
                        );
                      })}

                      <td className="py-2 px-2 text-xs border-l whitespace-nowrap sticky right-0 bg-white z-20 shadow-md max-w-[120px]">
                        {uniqueShifts.length > 0 ? (
                          uniqueShifts.map((shift) => (
                            <div
                              key={`${shift.startTime}-${shift.endTime}`}
                              className="mb-1"
                            >
                              <span className="block font-semibold">
                                {shift.startTime.split(":")[0]} -{" "}
                                {shift.endTime.split(":")[0]}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={timeSlots.length + 2}
                    className="py-2 px-4 text-center"
                  >
                    <li>
                      No employee allocated for{" "}
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </li>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RosterManagementPage;
