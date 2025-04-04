// src/services/NotificationAPI.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP error ${response.status}`;
    throw new Error(errorMessage);
  }
  
  try {
    // Try to parse as JSON
    return await response.json();
  } catch (error) {
    console.warn('Response is not valid JSON, returning empty array');
    return [];
  }
};

// Use mock data if API fails (for development/testing purposes)
const getMockNotifications = () => {
  console.warn('Using mock notification data');
  return [
    {
      _id: "mock1",
      type: "inventory",
      title: "Low Stock Alert",
      message: "5 products are below the reorder threshold",
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
      read: false,
      userId: "current-user"
    },
    {
      _id: "mock2",
      type: "staff",
      title: "New Time Off Request",
      message: "Michael Brown has requested time off",
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
      read: false,
      userId: "current-user"
    },
    {
      _id: "mock3",
      type: "sales",
      title: "Sales Milestone Reached",
      message: "Monthly sales target has been exceeded by 15%",
      createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(), // 3 hours ago
      read: true,
      userId: "current-user"
    }
  ];
};

export const getUserNotifications = async (token) => {
  console.log("📡 Fetching user notifications");
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    console.log("✅ Received notifications:", data);
    
    // Return the data array, or if it's an object with a notifications/data property, return that
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.notifications)) return data.notifications;
      if (Array.isArray(data.data)) return data.data;
    }
    
    // If we couldn't find an array in the response, log a warning and return an empty array
    console.warn('Unexpected API response format:', data);
    return [];
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    
    // For development, return mock data if API fails
    if (process.env.NODE_ENV !== 'production') {
      return getMockNotifications();
    }
    
    throw error;
  }
};

export const getUnreadNotifications = async (token) => {
  console.log("📡 Fetching unread notifications");
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    console.log("✅ Received unread notifications:", data);
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.notifications)) return data.notifications;
      if (Array.isArray(data.data)) return data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    
    // Return an empty array for unread notifications on error
    return [];
  }
};

export const getNewNotifications = async (token) => {
  console.log("📡 Fetching new notifications");
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/new`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    console.log("✅ Received new notifications:", data);
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.notifications)) return data.notifications;
      if (Array.isArray(data.data)) return data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching new notifications:", error);
    return [];
  }
};

export const getNotificationSummary = async (token) => {
  console.log("📡 Fetching notification summary");
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    console.log("✅ Received notification summary:", data);
    return data;
  } catch (error) {
    console.error("Error fetching notification summary:", error);
    return { unread: 0, total: 0 };
  }
};

export const markNotificationAsRead = async (token, notificationId, userId) => {
  console.log(`📡 Marking notification ${notificationId} as read for user ${userId}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await handleResponse(response);
    console.log("✅ Notification marked as read");
    return data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (token, userId) => {
  console.log("📡 Marking all notifications as read for user", userId);
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await handleResponse(response);
    console.log("✅ All notifications marked as read");
    return data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (token, notificationId) => {
  console.log(`📡 Deleting notification ${notificationId}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    console.log("✅ Notification deleted");
    return data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Admin functions
export const checkInventory = async (token) => {
  console.log("📡 Triggering inventory check");
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/check-inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    console.log("✅ Inventory check completed:", data);
    return data;
  } catch (error) {
    console.error("Error checking inventory:", error);
    throw error;
  }
};

export const checkRosters = async (token) => {
  console.log("📡 Triggering roster check");
  
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/check-rosters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    console.log("✅ Roster check completed:", data);
    return data;
  } catch (error) {
    console.error("Error checking rosters:", error);
    throw error;
  }
};