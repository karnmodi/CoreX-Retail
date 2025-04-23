import React, { useEffect, useState } from "react";
import { useProfile } from "../configs/ProfileContext";

const ActivityLogs = () => {
  const { activityData, activityLoading, activityError, fetchActivityData } =
    useProfile();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchActivityData(currentPage);
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    };

    loadData();
  }, [fetchActivityData, currentPage]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchActivityData(currentPage);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Safely get activities array
  const getActivities = () => {
    // If activityData is undefined or null, return empty array
    if (!activityData) return [];

    // If activityData is already an array
    if (Array.isArray(activityData)) {
      return activityData;
    }

    // If activityData has activities property (full API response)
    if (activityData.activities && Array.isArray(activityData.activities)) {
      return activityData.activities;
    }

    // If activityData is a single activity object
    if (activityData.id) {
      return [activityData];
    }

    return [];
  };

  // Filter activities
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

  // Get activity icon
  const getActivityIcon = (type) => {
    const activityType = (type || "").toLowerCase();

    if (activityType.includes("login")) {
      return "🔐";
    } else if (
      activityType.includes("sales") ||
      activityType.includes("dashboard")
    ) {
      return "📊";
    } else {
      return "📋";
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    if (typeof timestamp === "string") return timestamp;

    try {
      // Handle Firestore timestamp
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleString();
      }

      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            Activity Logs
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
            Track your recent actions and system updates
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
            }}
          >
            <option value="all">All Activities</option>
            <option value="login">Logins</option>
            <option value="sales">Dashboard</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={activityLoading || refreshing}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: activityLoading || refreshing ? "not-allowed" : "pointer",
              opacity: activityLoading || refreshing ? 0.7 : 1,
            }}
          >
            {activityLoading || refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
            Activity History
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
            Your recent actions and updates
          </p>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {activityLoading && !refreshing ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <p>Loading activity data...</p>
            </div>
          ) : activityError ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 0",
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  color: "#ef4444",
                }}
              >
                ⚠️
              </div>
              <p style={{ color: "#ef4444", margin: 0 }}>
                {typeof activityError === "string"
                  ? activityError
                  : "Error loading activity data"}
              </p>
              <button
                onClick={handleRefresh}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "white",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Try Again
              </button>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {filteredActivities.map((activity, index) => (
                <React.Fragment key={activity.id || index}>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div
                      style={{
                        marginRight: "16px",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getActivityIcon(activity.activityType || activity.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "4px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "500",
                            margin: 0,
                          }}
                        >
                          {activity.title}
                        </h3>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {activity.formattedTimestamp ||
                            formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          margin: 0,
                        }}
                      >
                        {activity.description}
                      </p>
                      {activity.metadata && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            color: "#94a3b8",
                          }}
                        >
                          {activity.metadata.path && (
                            <div>Path: {activity.metadata.path}</div>
                          )}
                          {activity.metadata.deviceInfo && (
                            <div>
                              Device:{" "}
                              {activity.metadata.deviceInfo.userAgent
                                ?.split(" ")
                                .slice(0, 3)
                                .join(" ")}
                              ...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < filteredActivities.length - 1 && (
                    <div style={{ height: "1px", background: "#e2e8f0" }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 0",
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  color: "#94a3b8",
                }}
              >
                🕒
              </div>
              <p
                style={{
                  color: "#64748b",
                  fontWeight: "500",
                  margin: 0,
                }}
              >
                No activity recorded yet.
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  textAlign: "center",
                  maxWidth: "400px",
                  margin: 0,
                }}
              >
                Your recent account activities will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Placeholder for pagination - add only if needed */}
      <div
        style={{
          marginTop: "16px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        Showing {filteredActivities.length} activities
      </div>
    </div>
  );
};

export default ActivityLogs;
