// src/services/NotificationAPI.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP error ${response.status}`;
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (error) {
    console.warn('Response is not valid JSON, returning empty array');
    return [];
  }
};

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

  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);

    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.notifications)) return data.notifications;
      if (Array.isArray(data.data)) return data.data;
    }

    console.warn('Unexpected API response format:', data);
    return [];

  } catch (error) {
    console.error("Error fetching notifications:", error);

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

// In your createNotification API function:
export const createNotification = async (token, notificationData) => {
  try {
    // Format the data exactly matching backend schema requirements
    const formattedData = {
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority || 'medium',
      targetRole: notificationData.targetRole || 'all',
      targetUsers: Array.isArray(notificationData.targetUsers) ? notificationData.targetUsers : [],
      targetStores: [],
      read: {},
      type: 'admin' 
    };
   
    // Add action if specified
    if (notificationData.action && notificationData.action.type !== 'none') {
      formattedData.action = {
        type: notificationData.action.type || 'link',
        destination: notificationData.action.destination || '',
        label: notificationData.action.label || 'View'
      };
    }
   
    // Add expiration date if provided
    if (notificationData.expiresAt) {
      formattedData.expiresAt = notificationData.expiresAt;
    }
    
    // Include sendPush as a separate property as backend expects it from req.body
    if (notificationData.sendPush) {
      formattedData.sendPush = true;
    }
   
    console.log("Final formatted notification:", JSON.stringify(formattedData, null, 2));
   
    // Make the API call with properly formatted data
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formattedData)
    });
    
    if (!response.ok) {
      let errorMessage = "Failed to create notification";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += ": " + errorData.details.join(", ");
        }
      } catch (e) {
        console.error("Failed to parse error response");
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getUserRoles = async (token) => {
  try {
    // First try to get roles from the backend API
    const response = await fetch(`${API_BASE_URL}/user-roles`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.roles || [];
    } else {
      // Return default roles if API fails
      return [
        { id: "all", name: "All Users" },
        { id: "admin", name: "Administrators" },
        { id: "manager", name: "Store Managers" },
        { id: "staff", name: "Staff Members" }
      ];
    }
  } catch (error) {
    console.error("Error fetching user roles:", error);
    // Return default roles on error
    return [
      { id: "all", name: "All Users" },
      { id: "admin", name: "Administrators" },
      { id: "manager", name: "Store Managers" },
      { id: "staff", name: "Staff Members" }
    ];
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