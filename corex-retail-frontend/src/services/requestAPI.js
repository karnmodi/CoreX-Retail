// src/services/requestAPI.js (Updated)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP error ${response.status}`;
        throw new Error(errorMessage);
    }

    try {
        return await response.json();
    } catch (error) {
        console.warn('Response is not valid JSON, returning empty object');
        return {};
    }
};


// Create a new request
export const createRequest = async (requestData, token) => {
    console.log("📡 Creating new request:", requestData);

    try {
        const response = await fetch(`${API_BASE_URL}/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
        });

        const data = await handleResponse(response);
        console.log("✅ Request created successfully:", data);
        return data;
    } catch (error) {
        console.error("Error creating request:", error);
        throw error;
    }
};

// Get all requests with optional filters
export const getRequests = async (filters = {}, token) => {
    console.log("📡 Fetching requests with filters:", filters);

    try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const response = await fetch(`${API_BASE_URL}/requests${queryString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await handleResponse(response);
        console.log("✅ Received requests:", data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching requests:", error);

        throw error;
    }
};

// Get current user's requests
export const getMyRequests = async (status = '', token) => {
    console.log("📡 Fetching my requests", status ? `with status: ${status}` : '');

    try {
        const queryString = status ? `?status=${status}` : '';
        const response = await fetch(`${API_BASE_URL}/requests/my-requests${queryString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await handleResponse(response);
        console.log("✅ Received my requests:", data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching my requests:", error);

        

        throw error;
    }
};

// Get pending requests for approval
export const getPendingRequests = async (token) => {
    console.log("📡 Fetching pending requests for approval");

    try {
        const response = await fetch(`${API_BASE_URL}/requests/pending`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await handleResponse(response);
        console.log("✅ Received pending requests:", data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching pending requests:", error);


        throw error;
    }
};

// Get request by ID
export const getRequestById = async (id, token) => {
    console.log(`📡 Fetching request details for ID: ${id}`);

    try {
        const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await handleResponse(response);
        console.log("✅ Received request details:", data);
        return data;
    } catch (error) {
        console.error("Error fetching request details:", error);

        

        throw error;
    }
};

// Update request status (approve/reject)
export const updateRequestStatus = async (id, statusData, token) => {
    console.log(`📡 Updating request ${id} status to: ${statusData.status}`);

    try {
        const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(statusData),
        });

        const data = await handleResponse(response);
        console.log("✅ Request status updated:", data);
        return data;
    } catch (error) {
        console.error("Error updating request status:", error);
        throw error;
    }
};

// Add comment to a request
export const addComment = async (id, commentText, token) => {
    console.log(`📡 Adding comment to request ${id}`);

    try {
        const response = await fetch(`${API_BASE_URL}/requests/${id}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: commentText }),
        });

        const data = await handleResponse(response);
        console.log("✅ Comment added successfully:", data);
        return data;
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};

// Delete a request
export const deleteRequest = async (id, token) => {
    console.log(`📡 Deleting request ${id}`);

    try {
        const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await handleResponse(response);
        console.log("✅ Request deleted successfully:", data);
        return data;
    } catch (error) {
        console.error("Error deleting request:", error);
        throw error;
    }
};

// Get request types for dropdowns
export const getRequestTypes = () => {
    return [
        { id: 'day_off', name: 'Day Off' },
        { id: 'sick_leave', name: 'Sick Leave' },
        { id: 'holiday_leave', name: 'Holiday Leave' },
        { id: 'multiple_shift_assignment', name: 'Multiple Shift Assignment' }
    ];
};

// Get request status options for filtering
export const getRequestStatusOptions = () => {
    return [
        { id: 'pending', name: 'Pending' },
        { id: 'approved', name: 'Approved' },
        { id: 'rejected', name: 'Rejected' }
    ];
};