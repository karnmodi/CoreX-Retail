import React, { useState, useEffect } from "react";
import { useRequest } from "../configs/RequestsContext";
import { useAuth } from "../configs/AuthContext";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";

const RequestDetails = ({ requestId, onClose }) => {
  const {
    fetchRequestById,
    selectedRequest,
    updateStatus,
    addRequestComment,
    loading,
    error,
  } = useRequest();
  const { userData } = useAuth();

  const [comment, setComment] = useState("");
  const [statusAction, setStatusAction] = useState("");
  const [actionComment, setActionComment] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (requestId) {
      fetchRequestById(requestId).catch((err) => {
        console.error("Failed to fetch request details:", err);
      });
    }
  }, [requestId, fetchRequestById]);

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "Not specified";
    if (!endDate || startDate === endDate) return startDate;
    return `${startDate} to ${endDate}`;
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "";

    let date;
    if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else if (timestamp.toDate && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleString();
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      await addRequestComment(requestId, comment);
      setComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!statusAction) return;

    setProcessingAction(true);
    setActionSuccess(false);
    setActionError("");

    try {
      await updateStatus(requestId, {
        status: statusAction,
        comment: actionComment.trim() || undefined,
      });

      setActionSuccess(true);
      setStatusAction("");
      setActionComment("");
    } catch (err) {
      console.error("Error updating status:", err);
      setActionError(err.message || "Failed to update request status");
    } finally {
      setProcessingAction(false);
    }
  };

  // Map request types to friendly names
  const requestTypeNames = {
    day_off: "Day Off",
    sick_leave: "Sick Leave",
    holiday_leave: "Holiday Leave",
    multiple_shift_assignment: "Multiple Shift Assignment",
  };

  // Map status to classes
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  };

  // Status icon mapping
  const statusIcons = {
    pending: <Clock className="h-5 w-5 text-yellow-500" />,
    approved: <CheckCircle className="h-5 w-5 text-green-500" />,
    rejected: <XCircle className="h-5 w-5 text-red-500" />,
  };

  // Check if user is an admin
  const isAdmin = userData?.role === "admin";

  if (loading && !selectedRequest) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="py-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedRequest) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!selectedRequest) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="py-6 text-center">
          <p className="text-gray-600">
            Request not found or you don't have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4xl shadow-lg max-w-4xl mx-auto overflow-hidden">
      <div
        className={`p-4 flex justify-between items-center ${
          selectedRequest.status === "pending"
            ? "bg-yellow-50"
            : selectedRequest.status === "approved"
            ? "bg-green-50"
            : "bg-red-50"
        }`}
      >
        <div className="flex items-center">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">Request Details</h2>
            <div className="flex items-center mt-1">
              {statusIcons[selectedRequest.status]}
              <span
                className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  statusClasses[selectedRequest.status] ||
                  "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              >
                {selectedRequest.status.charAt(0).toUpperCase() +
                  selectedRequest.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {actionSuccess && (
        <div className="mx-4 mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">Request status updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mx-4 mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{actionError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 max-h-[calc(80vh-8rem)] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Request Information Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <h3 className="font-medium text-blue-700 text-sm">
                Request Information
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-24">
                  Request Type
                </span>
                <span className="text-sm text-gray-900">
                  {requestTypeNames[selectedRequest.requestType] ||
                    selectedRequest.requestType}
                </span>
              </div>

              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-24">
                  Date Range
                </span>
                <span className="text-sm text-gray-900">
                  {formatDateRange(
                    selectedRequest.startDate,
                    selectedRequest.endDate
                  )}
                </span>
              </div>

              {selectedRequest.leaveReason && (
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    Reason
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedRequest.leaveReason}
                  </span>
                </div>
              )}

              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-24">
                  Created
                </span>
                <span className="text-sm text-gray-900">
                  {formatDateTime(selectedRequest.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Requester Information Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <h3 className="font-medium text-blue-700 text-sm">
                Requester Information
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-24">
                  Name
                </span>
                <span className="text-sm text-gray-900">
                  {selectedRequest.requesterName}
                </span>
              </div>

              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-24">
                  Role
                </span>
                <span className="text-sm text-gray-900">
                  {selectedRequest.requesterRole.charAt(0).toUpperCase() +
                    selectedRequest.requesterRole.slice(1)}
                </span>
              </div>

              {selectedRequest.processedBy &&
                selectedRequest.processedBy.name && (
                  <div className="flex items-start">
                    <span className="text-xs font-medium text-gray-500 w-24">
                      Processed By
                    </span>
                    <span className="text-sm text-gray-900">
                      {selectedRequest.processedBy.name}
                    </span>
                  </div>
                )}

              {selectedRequest.processedDate && (
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    Processed Date
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDateTime(selectedRequest.processedDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Staff Assignments (for multiple shift assignment requests) */}
        {selectedRequest.requestType === "multiple_shift_assignment" &&
          selectedRequest.staffAssignments &&
          selectedRequest.staffAssignments.length > 0 && (
            <div className="mb-4">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                  <h3 className="font-medium text-blue-700 text-sm">
                    Staff Assignments
                  </h3>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRequest.staffAssignments.map(
                        (assignment, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {assignment.staffName}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {assignment.date || selectedRequest.startDate}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {assignment.startTime}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {assignment.endTime}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* Comments Section */}
        <div className="mb-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center">
              <MessageSquare className="h-4 w-4 text-blue-700 mr-2" />
              <h3 className="font-medium text-blue-700 text-sm">Comments</h3>
            </div>
            <div className="p-4">
              {!selectedRequest.comments ||
              selectedRequest.comments.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {selectedRequest.comments.map((comment, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-lg text-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mt-4">
                <div className="mb-2">
                  <label
                    htmlFor="comment"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Add a comment
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Type your comment here..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!comment.trim() || loading}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Add Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Actions Section (only for admins and pending requests) */}
        {isAdmin && selectedRequest.status === "pending" && (
          <div className="mb-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                <h3 className="font-medium text-blue-700 text-sm">
                  Process Request
                </h3>
              </div>
              <div className="p-4">
                <form onSubmit={handleStatusUpdate} className="space-y-3">
                  <div>
                    <label
                      className="block text-xs font-medium text-gray-700 mb-1"
                      htmlFor="status-action"
                    >
                      Action
                    </label>
                    <select
                      id="status-action"
                      value={statusAction}
                      onChange={(e) => setStatusAction(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select action...</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium text-gray-700 mb-1"
                      htmlFor="action-comment"
                    >
                      Comment (optional)
                    </label>
                    <textarea
                      id="action-comment"
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Add a comment about your decision..."
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusAction("");
                        setActionComment("");
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                      disabled={processingAction}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!statusAction || processingAction}
                      className={`px-3 py-1.5 text-sm text-white rounded-lg transition-colors duration-200 ${
                        statusAction === "approved"
                          ? "bg-green-600 hover:bg-green-700"
                          : statusAction === "rejected"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {processingAction ? "Processing..." : "Submit"}
                    </button>
                  </div>
                </form>

                {/* Warning about shift removal for leave requests */}
                {["day_off", "sick_leave", "holiday_leave"].includes(
                  selectedRequest.requestType
                ) && (
                  <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs text-yellow-700">
                          <span className="font-medium">Important:</span>{" "}
                          Approving this request will automatically remove any
                          shifts scheduled for this employee during the
                          requested leave period.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;
