// src/pages/RequestsPage.jsx (Modified version)
import React, { useState, useEffect } from "react";
import { useRequest } from "../../configs/RequestsContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../configs/AuthContext";
import RequestDetails from "../../components/RequestDetails";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "../../components/ui/use-toast.jsx";
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Users,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  Filter,
  Plus,
} from "lucide-react";

const RequestsPage = () => {
  const {
    fetchRequests,
    fetchPendingRequests,
    fetchMyRequests,
    updateStatus,
    requests,
    pendingRequests,
    myRequests,
    loading,
    error,
    stats,
  } = useRequest();

  const { userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  

  // Set default active tab based on user role
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const isAdmin = userData?.role === "admin";
  const isManager = userData?.role === "store manager";
  const [activeTab, setActiveTab] = useState(isManager ? "my" : "pending");

  // Initial data fetch
  useEffect(() => {
    if (isAdmin || isManager) {
      fetchPendingRequests();
    }

    if (isAdmin) {
      fetchRequests();
    }

    if (isManager) {
      fetchMyRequests();
    }
  }, [
    isAdmin,
    isManager,
    fetchPendingRequests,
    fetchRequests,
    fetchMyRequests,
  ]);

  // Handle tab changes
  useEffect(() => {
    if (activeTab === "pending" && (isAdmin || isManager)) {
      fetchPendingRequests();
    } else if (activeTab === "all" && isAdmin) {
      fetchRequests(filters);
    } else if (activeTab === "my" && isManager) {
      fetchMyRequests();
    }
  }, [
    activeTab,
    isAdmin,
    isManager,
    fetchPendingRequests,
    fetchRequests,
    fetchMyRequests,
    filters,
  ]);

  // Filter handling
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    if (isAdmin && activeTab === "all") {
      fetchRequests(filters);
    }
    setShowFilters(false);
    toast({
      title: "Filters Applied",
      description: "Request list has been updated based on your filters.",
    });
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      type: "",
      startDate: "",
      endDate: "",
    });

    if (isAdmin && activeTab === "all") {
      fetchRequests({});
    }
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    });
  };

  // Request handling
  const handleViewRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedRequestId(null);

    // Refresh data
    if (activeTab === "pending" && (isAdmin || isManager)) {
      fetchPendingRequests();
    } else if (activeTab === "all" && isAdmin) {
      fetchRequests(filters);
    } else if (activeTab === "my" && isManager) {
      fetchMyRequests();
    }
  };

  const handleApproveRequest = async (requestId) => {
    setProcessingRequestId(requestId);
    try {
      await updateStatus(requestId, {
        status: "approved",
        approverNotes: "Request approved",
      });

      toast({
        title: "Request Approved",
        description: "The request has been successfully approved.",
        variant: "success",
      });

      if (activeTab === "pending") {
        fetchPendingRequests();
      } else if (activeTab === "all") {
        fetchRequests(filters);
      }
    } catch (err) {
      toast({
        title: "Approval Failed",
        description:
          "There was a problem approving the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessingRequestId(requestId);
    try {
      await updateStatus(requestId, {
        status: "rejected",
        approverNotes: "Request rejected",
      });

      toast({
        title: "Request Rejected",
        description: "The request has been rejected.",
        variant: "success",
      });

      if (activeTab === "pending") {
        fetchPendingRequests();
      } else if (activeTab === "all") {
        fetchRequests(filters);
      }
    } catch (err) {
      toast({
        title: "Rejection Failed",
        description:
          "There was a problem rejecting the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getDisplayRequests = () => {
    switch (activeTab) {
      case "pending":
        return pendingRequests || [];
      case "all":
        return requests || [];
      case "my":
        return myRequests || [];
      default:
        return [];
    }
  };

  function formatDate(input) {
    let date;

    if (input instanceof Date) {
      date = input;
    } else if (input?.toDate) {
      date = input.toDate();
    } else if (input?._seconds && input?._nanoseconds !== undefined) {
      date = new Date(input._seconds * 1000 + input._nanoseconds / 1e6);
    } else if (typeof input === "string" || typeof input === "number") {
      date = new Date(input);
    } else {
      console.warn("Invalid date format:", input);
      return "N/A"; // More user-friendly than "Invalid date"
    }

    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) {
      console.warn("Invalid date after conversion:", input);
      return "N/A";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const HandletoCreateNewRequest = () => {
    navigate("./create");
  };

  const getRequestTypeName = (type) => {
    const types = {
      day_off: "Day Off",
      sick_leave: "Sick Leave",
      holiday_leave: "Holiday Leave",
      multiple_shift_assignment: "Multiple Shift Assignment",
    };

    return types[type] || type;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6">
        <Card className="shadow-lg">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-sky-100 to-blue-200 p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-blue-900 mb-1">
                  Request Management
                </h1>
                <p className="text-blue-700 text-sm">
                  Manage and process all staff requests
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <div className="px-4 py-2 bg-white rounded-full shadow text-blue-800 font-medium">
                  Pending:{" "}
                  <span className="font-semibold">
                    {stats.pendingCount || 0}
                  </span>
                </div>
                {isAdmin && (
                  <div className="px-4 py-2 bg-white rounded-full shadow text-green-700 font-medium">
                    Approved:{" "}
                    <span className="font-semibold">
                      {stats.approvedCount || 0}
                    </span>
                  </div>
                )}

                <div className="px-4 py-2 bg-white rounded-full shadow text-red-700 font-medium">
                  Rejected:{" "}
                  <span className="font-semibold">
                    {stats.rejectedCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Tabs with New Request Button */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                {/* Tabs */}
                <nav className="flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`py-4 px-1 font-medium text-sm border-b-2 ${
                      activeTab === "pending"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Pending Approvals
                    {stats.pendingCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {stats.pendingCount}
                      </span>
                    )}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`py-4 px-1 font-medium text-sm border-b-2 ${
                        activeTab === "all"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      All Requests
                    </button>
                  )}

                  {/* Only show My Requests tab for store managers */}
                  {isManager && (
                    <button
                      onClick={() => setActiveTab("my")}
                      className={`py-4 px-1 font-medium text-sm border-b-2 ${
                        activeTab === "my"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      My Requests
                      {stats.myPendingCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          {stats.myPendingCount}
                        </span>
                      )}
                    </button>
                  )}
                </nav>

                {/* New Request Button */}
                {isManager && (
                  <button
                    onClick={HandletoCreateNewRequest}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow text-green-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    New Request
                  </button>
                )}
              </div>
            </div>

            {/* Filter Button (Only for Admin on All tab) */}
            {isAdmin && activeTab === "all" && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
            )}

            {/* Filters (only for admin on all requests tab) */}
            {isAdmin && activeTab === "all" && showFilters && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Filter Requests</CardTitle>
                  <CardDescription>
                    Narrow down results by specific criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Request Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="day_off">Day Off</option>
                        <option value="sick_leave">Sick Leave</option>
                        <option value="holiday_leave">Holiday Leave</option>
                        <option value="multiple_shift_assignment">
                          Multiple Shift Assignment
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        From Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        To Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-3 pt-0">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </CardFooter>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Request Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                  <p className="text-gray-600">Loading requests...</p>
                </div>
              ) : getDisplayRequests().length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      No requests found
                    </h3>
                    <p className="text-gray-500 text-center max-w-md">
                      There are no requests to display in this section. New
                      requests will appear here when they are submitted.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {getDisplayRequests().map((request) => (
                    <Card
                      key={request.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div
                        className={`h-2 ${
                          request.status === "pending"
                            ? "bg-yellow-500"
                            : request.status === "approved"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-medium">
                              {getRequestTypeName(request.requestType)}
                            </CardTitle>
                            <CardDescription>
                              From {request.requesterName} •{" "}
                              {request.requesterRole}
                            </CardDescription>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {request.startDate
                                ? formatDate(request.startDate)
                                : "N/A"}
                              {request.endDate &&
                              request.endDate !== request.startDate
                                ? ` to ${formatDate(request.endDate)}`
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              Submitted on{" "}
                              {request.createdAt
                                ? formatDate(request.createdAt)
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-end gap-2 border-t">
                        {isAdmin && request.status === "pending" && (
                          <>
                            <Button
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={processingRequestId === request.id}
                              variant="outline"
                              className="text-green-700 border-green-200 hover:bg-green-50"
                            >
                              {processingRequestId === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={processingRequestId === request.id}
                              variant="outline"
                              className="text-red-700 border-red-200 hover:bg-red-50"
                            >
                              {processingRequestId === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleViewRequest(request.id)}
                          variant="secondary"
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Information about automatic shift removal */}
            {(isAdmin || isManager) &&
              activeTab === "pending" &&
              pendingRequests?.length > 0 && (
                <Card className="mt-6 bg-blue-50 border-l-4 border-blue-500 shadow-sm">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h3 className="text-blue-800 font-medium">
                          Leave Request Automation
                        </h3>
                        <p className="text-blue-700 text-sm mt-1">
                          When a leave request is approved, any scheduled shifts
                          for that employee during the requested time period
                          will be automatically removed from the roster. All
                          relevant parties will be notified of affected shifts.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </CardContent>
        </Card>

        {/* Request Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <RequestDetails
                requestId={selectedRequestId}
                onClose={handleCloseDetails}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
                isAdmin={isAdmin}
                isManager={isManager}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
