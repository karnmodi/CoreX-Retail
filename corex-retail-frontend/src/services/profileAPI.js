const API_BASE_URL = import.meta.env.VITE_API_URL;


export const getProfile = async (token, userId) => {

  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching profile:", error.message);
    throw error;
  }
};


export const updateProfile = async (token, userId, profileData) => {

  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error updating profile:", error.message);
    throw error;
  }
};


export const uploadProfilePicture = async (token, userId, imageFile) => {

  try {
    const formData = new FormData();
    formData.append("profilePicture", imageFile);

    const response = await fetch(`${API_BASE_URL}/profile/${userId}/profile-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload profile picture");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error uploading profile picture:", error.message);
    throw error;
  }
};

export const updateAccountSettings = async (token, userId, settings) => {
  console.log("📡 Updating account settings for:", userId);

  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update account settings");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error updating account settings:", error.message);
    throw error;
  }
};


export const getPerformanceData = async (token, userId) => {

  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}/performance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch performance data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching performance data:", error.message);
    throw error;
  }
};


export const getUserActivity = async (token, userId, limit = 10) => {

  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}/activity?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user activity");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching user activity:", error.message);
    throw error;
  }
};