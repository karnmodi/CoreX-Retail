// src/contexts/RequestContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  createRequest,
  getRequests,
  getMyRequests,
  getPendingRequests,
  getRequestById,
  updateRequestStatus,
  addComment,
  deleteRequest,
  getRequestTypes,
  getRequestStatusOptions,
} from "../services/requestAPI";
import { useRoster } from "./RostersContext";

// Create the context
const RequestContext = createContext();

export const useRequest = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("useRequest must be used within a RequestProvider");
  }
  return context;
};

export const RequestProvider = ({ children }) => {
  const { token, userData } = useAuth();
  const { fetchShiftsForDate } = useRoster();

  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestTypes] = useState(getRequestTypes());
  const [statusOptions] = useState(getRequestStatusOptions());

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    myPendingCount: 0,
  });

  // Fetch all requests (for admin/manager)
  const fetchRequests = useCallback(
    async (filters = {}) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getRequests(filters, token);
        setRequests(data);

        // Update stats
        const pendingCount = data.filter((r) => r.status === "pending").length;
        const approvedCount = data.filter(
          (r) => r.status === "approved"
        ).length;
        const rejectedCount = data.filter(
          (r) => r.status === "rejected"
        ).length;

        setStats((prev) => ({
          ...prev,
          pendingCount,
          approvedCount,
          rejectedCount,
        }));

        return data;
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError(err.message || "Failed to fetch requests");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch my requests (for current user)
  const fetchMyRequests = useCallback(
    async (status = "") => {
      if (!token || !userData) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getMyRequests(status, token);
        setMyRequests(data);

        // Update stats for my pending requests
        const myPendingCount = data.filter(
          (r) => r.status === "pending"
        ).length;
        setStats((prev) => ({
          ...prev,
          myPendingCount,
        }));

        return data;
      } catch (err) {
        console.error("Error fetching my requests:", err);
        setError(err.message || "Failed to fetch your requests");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token, userData]
  );

  const fetchPendingRequests = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getPendingRequests(token);
      setPendingRequests(data);

      setStats((prev) => ({
        ...prev,
        pendingCount: data.length,
      }));

      return data;
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setError(err.message || "Failed to fetch pending requests");
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchRequestById = useCallback(
    async (id) => {
      if (!id || !token) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await getRequestById(id, token);
        setSelectedRequest(data);
        return data;
      } catch (err) {
        console.error(`Error fetching request ${id}:`, err);
        setError(err.message || "Failed to fetch request details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const submitRequest = useCallback(
    async (requestData) => {
      if (!token) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await createRequest(requestData, token);

        if (data) {
          setMyRequests((prev) => [data, ...prev]);

          setStats((prev) => ({
            ...prev,
            myPendingCount: prev.myPendingCount + 1,
            pendingCount: prev.pendingCount + 1,
          }));
        }

        return data;
      } catch (err) {
        console.error("Error creating request:", err);
        setError(err.message || "Failed to create request");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const updateStatus = useCallback(
    async (id, statusData) => {
      if (!id || !token) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await updateRequestStatus(id, statusData, token);

        const updateList = (list) =>
          list.map((req) =>
            req.id === id ? { ...req, status: statusData.status } : req
          );

        setRequests(updateList(requests));
        setPendingRequests((prev) => prev.filter((req) => req.id !== id));
        setMyRequests(updateList(myRequests));

        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest((prev) => ({
            ...prev,
            status: statusData.status,
          }));
        }

        setStats((prev) => {
          const newStats = { ...prev };

          newStats.pendingCount = Math.max(0, prev.pendingCount - 1);

          if (statusData.status === "approved") {
            newStats.approvedCount += 1;
          } else if (statusData.status === "rejected") {
            newStats.rejectedCount += 1;
          }

          if (
            selectedRequest &&
            selectedRequest.requesterId === userData?.uid
          ) {
            newStats.myPendingCount = Math.max(0, prev.myPendingCount - 1);
          }

          return newStats;
        });

        if (statusData.status === "approved" && selectedRequest) {
          const requestData = selectedRequest;

          if (
            ["day_off", "sick_leave", "holiday_leave"].includes(
              requestData.requestType
            )
          ) {
            const startDate = new Date(requestData.startDate);
            const endDate = requestData.endDate
              ? new Date(requestData.endDate)
              : new Date(requestData.startDate);

            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              fetchShiftsForDate(new Date(currentDate));

              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        }

        return data;
      } catch (err) {
        console.error(`Error updating request ${id} status:`, err);
        setError(err.message || "Failed to update request status");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      token,
      requests,
      myRequests,
      selectedRequest,
      userData,
      fetchShiftsForDate,
    ]
  );

  // Add a comment to a request
  const addRequestComment = useCallback(
    async (id, commentText) => {
      if (!id || !token || !commentText) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await addComment(id, commentText, token);

        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest(data.updatedData);
        }

        return data;
      } catch (err) {
        console.error(`Error adding comment to request ${id}:`, err);
        setError(err.message || "Failed to add comment");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, selectedRequest]
  );

  // Delete a request
  const removeRequest = useCallback(
    async (id) => {
      if (!id || !token) return false;

      setLoading(true);
      setError(null);

      try {
        await deleteRequest(id, token);

        // Remove from all relevant lists
        setRequests((prev) => prev.filter((req) => req.id !== id));
        setPendingRequests((prev) => prev.filter((req) => req.id !== id));
        setMyRequests((prev) => prev.filter((req) => req.id !== id));

        // Clear selected request if it was deleted
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest(null);
        }

        // Update stats if it was a pending request
        const deletedRequest = [
          ...requests,
          ...myRequests,
          ...pendingRequests,
        ].find((r) => r.id === id);
        if (deletedRequest && deletedRequest.status === "pending") {
          setStats((prev) => ({
            ...prev,
            pendingCount: Math.max(0, prev.pendingCount - 1),
            myPendingCount:
              deletedRequest.requesterId === userData?.uid
                ? Math.max(0, prev.myPendingCount - 1)
                : prev.myPendingCount,
          }));
        }

        return true;
      } catch (err) {
        console.error(`Error deleting request ${id}:`, err);
        setError(err.message || "Failed to delete request");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, requests, myRequests, pendingRequests, selectedRequest, userData]
  );

  // Clear the selected request
  const clearSelectedRequest = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  // Fetch initial data when component mounts
  useEffect(() => {
    if (token && userData) {
      // Fetch my requests first (all users have these)
      fetchMyRequests();

      // Then fetch approvals/all requests based on role
      if (
        userData.role === "admin" ||
        userData.role === "store manager"
      ) {
        fetchPendingRequests();

        // Only admin can see all requests
        if (userData.role === "admin") {
          fetchRequests();
        }
      }
    }
  }, [
    token,
    userData,
    fetchMyRequests,
    fetchPendingRequests,
    fetchRequests,
  ]);

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      setRequests([]);
      setMyRequests([]);
      setPendingRequests([]);
      setSelectedRequest(null);
    };
  }, []);

  // Context value
  const value = {
    // Data
    requests,
    myRequests,
    pendingRequests,
    selectedRequest,
    requestTypes,
    statusOptions,
    stats,
    loading,
    error,

    // Methods
    fetchRequests,
    fetchMyRequests,
    fetchPendingRequests,
    fetchRequestById,
    submitRequest,
    updateStatus,
    addRequestComment,
    removeRequest,
    clearSelectedRequest,
  };

  return (
    <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
  );
};

export default RequestContext;
