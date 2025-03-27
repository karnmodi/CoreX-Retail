// rostersAPI.js

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get all shifts (optional filter by date)
export const getAllShifts = async (date, token) => {
  const url = `${API_BASE_URL}/rosters/by-date?date=${date}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to fetch shifts: ${errorDetails}`);
  }

  return await response.json();
};


// Get all shifts on a specific date
export const getShiftsByDate = async (date, token) => {
  const response = await fetch(`${API_BASE_URL}/rosters/by-date?date=${date}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to fetch shifts by date: ${errorDetails}`);
  }

  return await response.json();
};


// Create a new shift
export const postShift = async (shiftData, token) => {
  const response = await fetch(`${API_BASE_URL}/rosters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(shiftData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to add shift");
  }

  return await response.json();
};

// Update an existing shift
export const putShift = async (id, updates, token) => {
  const response = await fetch(`${API_BASE_URL}/rosters/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update shift");
  }

  return await response.json();
};

// Delete a shift
export const deleteShiftById = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/rosters/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete shift");
  }

  return await response.json();
};
