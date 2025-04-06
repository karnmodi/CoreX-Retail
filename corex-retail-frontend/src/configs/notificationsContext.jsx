import {
  getUserNotifications,
  getUnreadNotifications,
  getNewNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationsAPI";

import { useAuth } from "../configs/AuthContext";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const NotificationContext = createContext();

// Custom hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const { user } = useAuth();
  const { token } = useAuth();
  const userId = user?.uid;

  // Map backend notification to frontend format
  const mapNotification = (notification) => {
    if (!notification || typeof notification !== "object") {
      console.warn("Invalid notification object:", notification);
      return {
        id: `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "default",
        title: "Unknown Notification",
        message: "Unable to load notification details",
        time: "Unknown time",
        read: true,
        icon: "Bell",
        createdAt: new Date().toISOString(),
        userId: null,
      };
    }

    // Define icon mapping based on notification type
    const iconMapping = {
      inventory: "Package",
      staff: "Users",
      roster: "Calendar",
      sales: "DollarSign",
      system: "Settings",
      order: "ShoppingBag",
      admin: "Users", // Adding admin type
      default: "Bell",
    };

    // Get ID
    const id = notification.id || notification._id || `generated-${Date.now()}`;

    // Determine if notification is read
    // API uses either isRead boolean or a read object with userIds
    let isRead = false;
    if (notification.isRead !== undefined) {
      isRead = !!notification.isRead;
    } else if (notification.read && typeof notification.read === "object") {
      // Check if current user's ID is in the read object
      const userId = token ? localStorage.getItem("userId") : null;
      isRead = userId ? !!notification.read[userId] : false;
    }

    // Format createdAt timestamp
    let timestamp = new Date();
    let formattedTime = "Just now";

    try {
      if (notification.createdAt) {
        if (notification.createdAt._seconds) {
          // Handle Firestore timestamp format
          timestamp = new Date(notification.createdAt._seconds * 1000);
        } else if (typeof notification.createdAt === "string") {
          timestamp = new Date(notification.createdAt);
        } else if (notification.createdAt instanceof Date) {
          timestamp = notification.createdAt;
        }
        formattedTime = formatRelativeTime(timestamp);
      }
    } catch (error) {
      console.warn("Error formatting time:", error);
    }

    // Map to our frontend format
    return {
      id: id,
      type: notification.type || "default",
      title: notification.title || "Untitled Notification",
      message:
        notification.message ||
        notification.content ||
        notification.text ||
        "No details available",
      time: formattedTime,
      read: isRead,
      icon: iconMapping[notification.type] || iconMapping.default,
      createdAt: timestamp.toISOString(),
      userId: notification.userId || null,
      priority: notification.priority || "normal",
      action: notification.action || null,
      details: notification.details || null,
      // Keep original data for reference if needed
      original: notification,
    };
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    if (diffHour < 24)
      return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getUserNotifications(token);
      console.log("API Response:", response);

      // Process notifications
      let notificationsData = [];

      if (Array.isArray(response)) {
        notificationsData = response;
      } else if (response && typeof response === "object") {
        if (Array.isArray(response.notifications)) {
          notificationsData = response.notifications;
        } else if (response.data && Array.isArray(response.data)) {
          notificationsData = response.data;
        }
      }

      // Map notifications
      const mappedNotifications = notificationsData.map(mapNotification);
      setNotifications(mappedNotifications);

      // Count truly unread notifications
      const unreadItems = mappedNotifications.filter(
        (notification) => !notification.read
      );
      setUnreadCount(unreadItems.length);

      setLastRefreshed(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      const data = await getUnreadNotifications(token);
      setUnreadCount(data.length);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token || !user?.uid) return;

    try {
      await markNotificationAsRead(token, notificationId, user.uid);

      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.id === notificationId) {
            const updatedOriginal = { ...notification.original };

            updatedOriginal.read = {
              ...(updatedOriginal.read || {}),
              [user.uid]: true,
            };
            updatedOriginal.isRead = true;

            return {
              ...notification,
              read: true,
              original: updatedOriginal,
            };
          }
          return notification;
        })
      );

      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return { success: true, message: "Notification marked as read" };
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token || !user?.uid) return;

    try {
      await markAllNotificationsAsRead(token, user.uid);

      setNotifications((prev) =>
        prev.map((notification) => {
          if (!notification.read) {
            const updatedOriginal = { ...notification.original };

            updatedOriginal.read = {
              ...(updatedOriginal.read || {}),
              [user.uid]: true,
            };
            updatedOriginal.isRead = true;

            return {
              ...notification,
              read: true,
              original: updatedOriginal,
            };
          }
          return notification;
        })
      );

      setUnreadCount(0);
      return { success: true, message: "All notifications marked as read" };
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Delete notification
  const removeNotification = async (notificationId) => {
    if (!token) return;

    try {
      await deleteNotification(token, notificationId);

      // Update local state
      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if needed
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return { success: true, message: "Notification deleted successfully" };
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };


  // Create a new notification
  const addNotification = async (notificationData) => {
    if (!token) return { success: false, message: "Not authenticated" };

    try {
      const createdNotification = await createNotification(token, notificationData);
      
      // Add to local state
      const mappedNotification = mapNotification(createdNotification);
      setNotifications((prev) => [mappedNotification, ...prev]);
      
      // Refresh notifications to ensure correct data
      fetchNotifications();
      
      return { 
        success: true, 
        message: "Notification created successfully",
        notification: mappedNotification
      };
    } catch (err) {
      console.error("Error creating notification:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter((n) => n.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter((n) => !n.read);
  };

  //Refresh notifications
  const refreshNotifications = async () => {
    const res = fetchNotifications();
    const data = await res.json();
    setNotifications(data);
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Set up polling for new notifications (every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        lastRefreshed,
        fetchNotifications,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        addNotification,
        getNotificationsByType,
        getUnreadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
