import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  FileText,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../configs/AuthContext";
import { useRequest } from "../../configs/RequestsContext";

const StaffRequestForm = () => {
  const navigate = useNavigate();
  const { userData, isAuthenticated } = useAuth();
  const { submitRequest, loading } = useRequest();

  const [formData, setFormData] = useState({
    requestType: "day_off",
    startDate: "",
    endDate: "",
    note: "",
    leaveReason: "",
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const requestTypes = [
    {
      id: "day_off",
      name: "Day Off",
      description: "Request a single day off work",
      color: "blue",
    },
    {
      id: "holiday_leave",
      name: "Holiday Leave",
      description: "Request vacation time (multiple days)",
      color: "green",
    },
    {
      id: "sick_leave",
      name: "Sick Leave",
      description: "Report illness or medical appointments",
      color: "red",
    },
    {
      id: "other",
      name: "Other",
      description: "Any other absence requests",
      color: "purple",
    },
  ];

  const getTypeColor = (type) => {
    const typeMap = {
      day_off: "bg-blue-100 text-blue-800 border-blue-200",
      holiday_leave: "bg-green-100 text-green-800 border-green-200",
      sick_leave: "bg-red-100 text-red-800 border-red-200",
      other: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return typeMap[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.requestType) {
      newErrors.requestType = "Request type is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (formData.requestType === "holiday_leave" && !formData.endDate) {
      newErrors.endDate = "End date is required for holiday leave";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date cannot be before start date";
    }

    if (formData.requestType !== "sick_leave" && formData.startDate) {
      const today = new Date();
      const startDate = new Date(formData.startDate);
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.startDate =
          "Start date cannot be in the past (except for sick leave)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    if (
      field === "startDate" &&
      (formData.requestType === "day_off" ||
        formData.requestType === "sick_leave")
    ) {
      setFormData((prev) => ({
        ...prev,
        endDate: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated || !userData) {
      setSubmitStatus("error");
      setErrors({ general: "You must be logged in to submit a request" });
      return;
    }

    try {
      const requestData = {
        requestType: formData.requestType,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        note: formData.note,
        leaveReason: formData.leaveReason,
      };

      const result = await submitRequest(requestData);

      if (result) {
        setSubmitStatus("success");

        setTimeout(() => {
          setFormData({
            requestType: "day_off",
            startDate: "",
            endDate: "",
            note: "",
            leaveReason: "",
          });
          setSubmitStatus(null);
          navigate("../");
        }, 2000);
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setSubmitStatus("error");
      setErrors({
        general: error.message || "Failed to submit request. Please try again.",
      });
      setTimeout(() => {
        setSubmitStatus(null);
        setErrors({});
      }, 5000);
    }
  };

  const calculateDuration = () => {
    if (!formData.startDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate || formData.startDate);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!isAuthenticated || !userData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Authentication Required
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              You must be logged in to create a request.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-red-600 hover:bg-red-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-100 mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("../")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create New Request
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Submit a new absence or leave request
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {submitStatus === "success" && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Request submitted successfully!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {submitStatus === "error" && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {errors.general ||
                  "Failed to submit request. Please try again."}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Request Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Request Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {requestTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleInputChange("requestType", type.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.requestType === type.id
                          ? getTypeColor(type.id) + " border-current"
                          : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
                      }`}
                    >
                      <div className="font-medium">{type.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.requestType && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.requestType}
                  </p>
                )}
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
                    min={
                      formData.requestType === "sick_leave"
                        ? undefined
                        : new Date().toISOString().split("T")[0]
                    }
                  />
                  {errors.startDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date{" "}
                    {formData.requestType === "holiday_leave"
                      ? "*"
                      : "(Optional)"}
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
                    min={formData.startDate}
                    disabled={
                      formData.requestType === "day_off" ||
                      formData.requestType === "sick_leave"
                    }
                  />
                  {errors.endDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Leave Reason (for sick leave) */}
              {formData.requestType === "sick_leave" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Sick Leave (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.leaveReason}
                    onChange={(e) =>
                      handleInputChange("leaveReason", e.target.value)
                    }
                    placeholder="e.g., Doctor's appointment, flu symptoms..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  placeholder="Any additional information or context for your request..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("../")}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Summary */}
        <div className="space-y-6">
          {/* Request Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {userData?.firstName || "Unknown"}{" "}
                  {userData?.lastName || "User"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <Badge className={getTypeColor(formData.requestType)}>
                    {requestTypes.find((t) => t.id === formData.requestType)
                      ?.name || "Day Off"}
                  </Badge>
                </div>
              </div>

              {formData.startDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Date Range</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                    <div>{formatDate(formData.startDate)}</div>
                    {formData.endDate &&
                      formData.endDate !== formData.startDate && (
                        <div>to {formatDate(formData.endDate)}</div>
                      )}
                  </div>
                </div>
              )}

              {formData.startDate && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Duration: {calculateDuration()} day
                    {calculateDuration() !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Submit requests at least 7 days in advance for planned
                  absences
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Sick leave can be submitted on the day if necessary</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Holiday requests require manager approval</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>You'll receive email notifications for status updates</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffRequestForm;
