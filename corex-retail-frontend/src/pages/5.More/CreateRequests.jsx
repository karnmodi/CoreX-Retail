import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRequest } from "../../configs/RequestsContext";
import { useAuth } from "../../configs/AuthContext";
import { useStaff } from "../../configs/StaffContext";
import { useToast } from "@/components/ui/use-toast";
import FloatingLabelInput from "../../components/small/FloatingLabelInput";
import FloatingLabelSelect from "../../components/small/FloatingLabelSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Save,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Plus,
  Trash2,
  CalendarDays,
  UserCircle,
  FileEdit,
  AlertCircle,
} from "lucide-react";

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const {
    submitRequest,
    loading: requestLoading,
    error: requestError,
  } = useRequest();
  const { currentUser, userData } = useAuth();
  const { staff, loading: staffLoading, error: staffError } = useStaff();
  const { toast } = useToast();

  // Request type options
  const REQUEST_TYPES = [
    { value: "day_off", label: "Day Off" },
    { value: "sick_leave", label: "Sick Leave" },
    { value: "holiday_leave", label: "Holiday Leave" },
    { value: "multiple_shift_assignment", label: "Multiple Shift Assignment" },
  ];

  // Base state
  const [activeTab, setActiveTab] = useState("leave");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leave request state
  const [leaveRequest, setLeaveRequest] = useState({
    requestType: "day_off",
    staffId: currentUser?.uid || "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    leaveReason: "",
  });

  // Shift assignment state
  const [shiftAssignment, setShiftAssignment] = useState({
    requestType: "multiple_shift_assignment",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    staffAssignments: [
      {
        staffId: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "17:00",
      },
    ],
  });

  // Check if user is a manager
  const isManager =
    userData?.role === "admin" || userData?.role === "store manager";

  // Handle leave request form changes
  const handleLeaveRequestChange = (e) => {
    const { name, value } = e.target;
    setLeaveRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle shift assignment form changes
  const handleShiftAssignmentChange = (e) => {
    const { name, value } = e.target;
    setShiftAssignment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle staff assignment changes
  const handleStaffAssignmentChange = (index, field, value) => {
    setShiftAssignment((prev) => {
      const newAssignments = [...prev.staffAssignments];
      newAssignments[index] = {
        ...newAssignments[index],
        [field]: value,
      };
      return {
        ...prev,
        staffAssignments: newAssignments,
      };
    });
  };

  // Add new staff assignment
  const addStaffAssignment = () => {
    setShiftAssignment((prev) => ({
      ...prev,
      staffAssignments: [
        ...prev.staffAssignments,
        {
          staffId: "",
          date: prev.startDate,
          startTime: "09:00",
          endTime: "17:00",
        },
      ],
    }));
  };

  // Remove staff assignment
  const removeStaffAssignment = (index) => {
    setShiftAssignment((prev) => {
      const newAssignments = [...prev.staffAssignments];
      newAssignments.splice(index, 1);
      return {
        ...prev,
        staffAssignments: newAssignments,
      };
    });
  };

  // Update all assignment dates when main date changes
  useEffect(() => {
    if (activeTab === "shifts") {
      setShiftAssignment((prev) => ({
        ...prev,
        staffAssignments: prev.staffAssignments.map((assignment) => ({
          ...assignment,
          date: prev.startDate,
        })),
      }));
    }
  }, [shiftAssignment.startDate, activeTab]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestData =
        activeTab === "leave" ? leaveRequest : shiftAssignment;

      // For leave requests, ensure dates are valid
      if (activeTab === "leave") {
        if (new Date(leaveRequest.startDate) > new Date(leaveRequest.endDate)) {
          throw new Error("End date cannot be before start date");
        }
      }

      // For shift assignments, validate required fields
      if (activeTab === "shifts") {
        if (shiftAssignment.staffAssignments.length === 0) {
          throw new Error("At least one staff assignment is required");
        }

        for (const assignment of shiftAssignment.staffAssignments) {
          if (!assignment.staffId) {
            throw new Error(
              "All assignments must have a staff member selected"
            );
          }

          if (!assignment.startTime || !assignment.endTime) {
            throw new Error("All assignments must have start and end times");
          }

          if (assignment.startTime >= assignment.endTime) {
            throw new Error(
              "End time must be after start time for all assignments"
            );
          }
        }
      }

      const result = await submitRequest(requestData);

      toast({
        title: "Success",
        description: `Request created successfully!`,
        variant: "success",
      });

      setTimeout(() => {
        navigate("../more/requests");
      }, 1000);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to create request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get staff member name by ID
  const getStaffName = (id) => {
    const member = staff.find((s) => s.id === id);
    return member ? member.name : "Unknown";
  };

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Create Request</h1>
        <Button
          variant="outline"
          onClick={() => navigate("../more/requests")}
          className="hidden md:flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Requests
        </Button>
      </div>

      {requestError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{requestError}</p>
        </div>
      )}

      {staffLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>Loading staff data...</p>
        </div>
      ) : (
        <Tabs
          defaultValue="leave"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leave" className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-2" />
              Leave Request
            </TabsTrigger>
            <TabsTrigger
              value="shifts"
              className="flex items-center"
              disabled={!isManager}
            >
              <Users className="w-4 h-4 mr-2" />
              Multiple Shift Assignment
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            {/* Leave Request Tab */}
            <TabsContent value="leave" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Leave Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingLabelSelect
                      name="requestType"
                      value={leaveRequest.requestType}
                      onChange={handleLeaveRequestChange}
                      label="Request Type"
                      options={REQUEST_TYPES.filter(
                        (type) => type.value !== "multiple_shift_assignment"
                      )}
                      required
                    />

                    {isManager && (
                      <FloatingLabelSelect
                        name="staffId"
                        value={leaveRequest.staffId}
                        onChange={handleLeaveRequestChange}
                        label="Staff Member"
                        options={[
                          { value: currentUser?.uid, label: "Myself" },
                          ...staff
                            .filter((member) => member.id !== currentUser?.uid)
                            .map((member) => ({
                              value: member.id,
                              label:
                                member.name ||
                                member.displayName ||
                                member.email,
                            })),
                        ]}
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                          type="date"
                          name="startDate"
                          value={leaveRequest.startDate}
                          onChange={handleLeaveRequestChange}
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                          type="date"
                          name="endDate"
                          value={leaveRequest.endDate}
                          onChange={handleLeaveRequestChange}
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Leave (Optional)
                    </label>
                    <textarea
                      name="leaveReason"
                      value={leaveRequest.leaveReason}
                      onChange={handleLeaveRequestChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter reason for leave request..."
                    />
                  </div>

                  {leaveRequest.requestType === "sick_leave" && (
                    <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">
                          Sick leave requests are automatically prioritized. You
                          may be asked to provide documentation if the leave
                          period exceeds three consecutive days.
                        </p>
                      </div>
                    </div>
                  )}

                  {leaveRequest.requestType === "holiday_leave" && (
                    <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">
                          Holiday leave requests should be submitted at least 2
                          weeks in advance. Please check with your manager about
                          busy periods before requesting extended leave.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {(leaveRequest.requestType === "day_off" ||
                leaveRequest.requestType === "sick_leave" ||
                leaveRequest.requestType === "holiday_leave") && (
                <Card>
                  <CardContent className="p-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <span className="font-medium">Note:</span> When
                          approved, any shifts scheduled during this leave
                          period will be automatically removed.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Multiple Shift Assignment Tab */}
            <TabsContent value="shifts" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Multiple Shift Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <input
                        type="date"
                        name="startDate"
                        value={shiftAssignment.startDate}
                        onChange={handleShiftAssignmentChange}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      This date will be applied to all staff assignments below.
                    </p>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-700">
                        Staff Assignments
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addStaffAssignment}
                        className="flex items-center text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Staff
                      </Button>
                    </div>

                    {shiftAssignment.staffAssignments.map(
                      (assignment, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-700 flex items-center">
                              <UserCircle className="w-4 h-4 mr-1 text-blue-500" />
                              Assignment #{index + 1}
                            </h4>
                            {shiftAssignment.staffAssignments.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStaffAssignment(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Staff Member
                              </label>
                              <select
                                value={assignment.staffId}
                                onChange={(e) =>
                                  handleStaffAssignmentChange(
                                    index,
                                    "staffId",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                <option value="">Select Staff</option>
                                {staff.map((member) => (
                                  <option key={member.id} value={member.id}>
                                    {member.name ||
                                      member.firstName + " " + member.lastName + " (" + `${member.role}` + ")" ||
                                      member.email}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                              </label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <input
                                  type="time"
                                  value={assignment.startTime}
                                  onChange={(e) =>
                                    handleStaffAssignmentChange(
                                      index,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                              </label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <input
                                  type="time"
                                  value={assignment.endTime}
                                  onChange={(e) =>
                                    handleStaffAssignmentChange(
                                      index,
                                      "endTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {assignment.staffId && (
                            <div className="mt-2 text-sm text-gray-500 flex items-center">
                              <FileEdit className="w-3 h-3 mr-1" />
                              Assigning shift to{" "}
                              {getStaffName(assignment.staffId)}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {shiftAssignment.staffAssignments.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        No staff assignments added yet.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addStaffAssignment}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Staff Assignment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Requested shifts will be automatically added to the
                        roster once approved. Staff members will be notified by
                        notification alerts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Submission Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("../more/requests")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || requestLoading}
              >
                {isSubmitting || requestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      )}
    </div>
  );
};

export default CreateRequestPage;
