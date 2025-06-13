import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Plus,
  RefreshCw,
  Filter,
  Eye,
  X,
  User,
  Calendar,
  Trash2,
} from "lucide-react";

const StaffRequestsView = ({
  myRequests = [],
  stats = {},
  onNavigate,
  onRefresh,
  onCancelRequest,
  isLoading = false,
}) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancellingRequestId, setCancellingRequestId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Ensure safe access to stats with defaults
  const safeStats = {
    myPendingCount: stats?.myPendingCount || 0,
    approvedCount: stats?.approvedCount || 0,
    rejectedCount: stats?.rejectedCount || 0,
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format full date for modal
  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  // Filter requests based on status
  const filteredRequests =
    myRequests?.filter((request) => {
      if (statusFilter === "all") return true;
      return request.status === statusFilter;
    }) || [];

  // Calculate time since request
  const getTimeSince = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Calculate duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate || startDate);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  // Handle cancel request
  const handleCancelRequest = async (requestId) => {
    if (!onCancelRequest) return;

    setCancellingRequestId(requestId);
    try {
      await onCancelRequest(requestId);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to cancel request:", error);
    } finally {
      setCancellingRequestId(null);
    }
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setShowDropdown(false);
  };

  // Modal Component
  const RequestDetailsModal = () => {
    if (!showModal || !selectedRequest) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3">
              {getStatusIcon(selectedRequest.status)}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Request Details
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  ID: {selectedRequest.id?.slice(-8) || "N/A"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseModal}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Status and Type */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg capitalize mb-1">
                  {selectedRequest.requestType?.replace(/_/g, " ") || "Request"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Submitted {getTimeSince(selectedRequest.createdAt)}
                </p>
              </div>
              <Badge
                variant={getStatusBadgeVariant(selectedRequest.status)}
                className="px-3 py-1 text-sm"
              >
                {selectedRequest.status?.charAt(0).toUpperCase() +
                  selectedRequest.status?.slice(1)}
              </Badge>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Requester
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      {selectedRequest.requesterName || "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      {formatFullDate(selectedRequest.startDate)}
                    </span>
                  </div>
                </div>

                {selectedRequest.endDate &&
                  selectedRequest.endDate !== selectedRequest.startDate && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        End Date
                      </label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-sm">
                          {formatFullDate(selectedRequest.endDate)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      {calculateDuration(
                        selectedRequest.startDate,
                        selectedRequest.endDate
                      )}{" "}
                      day
                      {calculateDuration(
                        selectedRequest.startDate,
                        selectedRequest.endDate
                      ) !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Created
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      {formatFullDate(selectedRequest.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Reason (for sick leave) */}
            {selectedRequest.leaveReason && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Leave Reason
                </label>
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedRequest.leaveReason}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {selectedRequest.note && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Additional Notes
                </label>
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedRequest.note}
                  </p>
                </div>
              </div>
            )}

            {/* Manager Response */}
            {selectedRequest.approverNote && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Manager Response
                </label>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedRequest.approverNote}
                  </p>
                </div>
              </div>
            )}

            {/* Processed Information */}
            {selectedRequest.processedBy && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Processed By
                </label>
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedRequest.processedBy.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 dark:border-slate-600">
            <div className="text-xs text-slate-500">
              Last updated: {formatFullDate(selectedRequest.updatedAt)}
            </div>
            <div className="flex gap-3">
              {selectedRequest.status === "pending" && onCancelRequest && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelRequest(selectedRequest.id)}
                  disabled={cancellingRequestId === selectedRequest.id}
                >
                  {cancellingRequestId === selectedRequest.id ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Request
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {myRequests?.length || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Pending
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {safeStats.myPendingCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {myRequests?.filter((r) => r.status === "approved").length ||
                    0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {myRequests?.filter((r) => r.status === "rejected").length ||
                    0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Requests */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              My Requests
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onNavigate("./requests/create")}
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
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
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => (
                <div
                  key={request.id || index}
                  className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="font-medium text-lg capitalize">
                          {request.requestType?.replace(/_/g, " ") || "Request"}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Submitted {getTimeSince(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(request.status)}
                      className="px-3 py-1"
                    >
                      {request.status?.charAt(0).toUpperCase() +
                        request.status?.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(request.startDate)}
                        {request.endDate &&
                        request.endDate !== request.startDate
                          ? ` - ${formatDate(request.endDate)}`
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {calculateDuration(request.startDate, request.endDate)}{" "}
                        day
                        {calculateDuration(
                          request.startDate,
                          request.endDate
                        ) !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  </div>

                  {request.note && (
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg text-sm mt-3 border border-slate-200 dark:border-slate-600">
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Note: </span>
                        {request.note}
                      </p>
                    </div>
                  )}

                  {request.approverNote && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm mt-3 border border-blue-200 dark:border-blue-700">
                      <p className="text-blue-800 dark:text-blue-200">
                        <span className="font-medium">Manager Response: </span>
                        {request.approverNote}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <div className="text-xs text-slate-500">
                      Request ID: {request.id?.slice(-8) || "N/A"}
                    </div>
                    <div className="flex gap-2">
                      {request.status === "pending" && onCancelRequest && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelRequest(request.id)}
                          disabled={cancellingRequestId === request.id}
                        >
                          {cancellingRequestId === request.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                {statusFilter === "all"
                  ? "No requests found"
                  : `No ${statusFilter} requests`}
              </h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                {statusFilter === "all"
                  ? "You haven't submitted any requests yet"
                  : `You don't have any ${statusFilter} requests`}
              </p>
              <Button
                onClick={() => onNavigate("./requests/create")}
                className="bg-gradient-to-r from-primary to-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Information & Guidelines */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Request Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">
                Request Types
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Day Off</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Request a single day off work
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Holiday Leave</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Request vacation time (multiple days)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Sick Leave</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Report illness or medical appointments
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Other</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Any other absence requests
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">
                Important Notes
              </h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p>
                  • Submit requests at least 7 days in advance for planned
                  absences
                </p>
                <p>• Sick leave can be submitted on the day if necessary</p>
                <p>• Holiday requests require manager approval</p>
                <p>
                  • Emergency requests should be discussed directly with your
                  manager
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-primary/90"
              onClick={() => onNavigate("./requests/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      <RequestDetailsModal />
    </div>
  );
};

export default StaffRequestsView;
