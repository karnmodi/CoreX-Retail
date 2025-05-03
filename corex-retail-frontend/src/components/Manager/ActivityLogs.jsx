import React, { useEffect, useState } from "react";
import { useProfile } from "../../configs/ProfileContext";
import {
  RefreshCw,
  Clock,
  Filter,
  AlertCircle,
  LogIn,
  FileEdit,
  Key,
  UserCheck,
  UserX,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ActivityIcon = ({ type }) => {
  const activityType = (type || "").toLowerCase();

  if (activityType.includes("login")) {
    return <LogIn className="h-5 w-5 text-blue-500" />;
  } else if (
    activityType.includes("profile_update") ||
    activityType.includes("profile")
  ) {
    return <FileEdit className="h-5 w-5 text-green-500" />;
  } else if (activityType.includes("password")) {
    return <Key className="h-5 w-5 text-purple-500" />;
  } else if (activityType.includes("picture")) {
    return <UserCheck className="h-5 w-5 text-orange-500" />;
  } else if (activityType.includes("logout")) {
    return <UserX className="h-5 w-5 text-red-500" />;
  } else if (
    activityType.includes("settings") ||
    activityType.includes("dashboard")
  ) {
    return <Settings className="h-5 w-5 text-indigo-500" />;
  } else if (activityType.includes("sales")) {
    return <FileText className="h-5 w-5 text-pink-500" />;
  } else {
    return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

const ActivityLogs = () => {
  const { activityData, activityLoading, activityError, fetchActivityData } =
    useProfile();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchActivityData(itemsPerPage, currentPage);
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    };

    loadData();
  }, [fetchActivityData, currentPage, itemsPerPage]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchActivityData(itemsPerPage, currentPage);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getActivities = () => {
    if (!activityData) return [];

    if (Array.isArray(activityData)) {
      return activityData;
    }

    if (activityData.activities && Array.isArray(activityData.activities)) {
      if (activityData.totalPages) {
        setTotalPages(activityData.totalPages);
      }
      return activityData.activities;
    }

    if (activityData.id) {
      return [activityData];
    }

    return [];
  };

  const filterActivities = (activities) => {
    if (!activities || activities.length === 0) return [];
    if (filter === "all") return activities;

    return activities.filter((activity) => {
      const type = activity.activityType || activity.type || "";
      return type.toLowerCase().includes(filter.toLowerCase());
    });
  };

  const activities = getActivities();
  const filteredActivities = filterActivities(activities);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    if (typeof timestamp === "string") return timestamp;

    try {
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleString();
      }

      const date = new Date(timestamp);

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date >= today) {
        return `Today at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else if (date >= yesterday) {
        return `Yesterday at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else {
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      return "Invalid date";
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="max-w-100% mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your recent actions and system updates
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="login">Logins</option>
              <option value="sales">Dashboard</option>
              <option value="profile">Profile Updates</option>
              <option value="settings">Settings</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={handleRefresh}
            disabled={activityLoading || refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {refreshing || activityLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>
              {refreshing || activityLoading ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {/* Activity List Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Activity History
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View your recent activity
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {filteredActivities.length > 0 && (
              <span>Showing {filteredActivities.length} activities</span>
            )}
          </div>
        </div>

        {activityLoading && !refreshing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 text-sm">
              Loading your activity data...
            </p>
          </div>
        ) : activityError ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500 font-medium mb-2">
              {typeof activityError === "string"
                ? activityError
                : "Error loading activity data"}
            </p>
            <p className="text-gray-500 text-sm text-center max-w-md mb-6">
              We couldn't retrieve your activity logs. Please try again later.
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <ActivityIcon
                      type={activity.activityType || activity.type}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                      <h3 className="text-base font-medium text-gray-900 truncate">
                        {activity.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {activity.formattedTimestamp ||
                          formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {activity.description}
                    </p>
                    {activity.metadata && (
                      <div className="mt-2 text-xs text-gray-400 space-y-1">
                        {activity.metadata.path && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Path:</span>
                            <span className="truncate">
                              {activity.metadata.path}
                            </span>
                          </div>
                        )}
                        {activity.metadata.deviceInfo && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Device:</span>
                            <span className="truncate">
                              {activity.metadata.deviceInfo.userAgent
                                ?.split(" ")
                                .slice(0, 3)
                                .join(" ")}
                              ...
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Clock className="h-16 w-16 text-gray-300 mb-4" />
            <p className="font-medium text-gray-700 mb-2">
              No activity recorded yet
            </p>
            <p className="text-gray-500 text-sm text-center max-w-md">
              Your recent account activities will appear here. All your actions
              will be tracked and displayed for your reference.
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Display Status Footer */}
        {!totalPages ||
          (totalPages <= 1 && (
            <div className="px-6 py-3 border-t border-gray-100 text-center text-xs text-gray-500">
              {filteredActivities.length > 0
                ? `Showing ${filteredActivities.length} activities`
                : "No activities to display"}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ActivityLogs;
