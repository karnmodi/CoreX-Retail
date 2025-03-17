
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getAllEmployees = async (token) => {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return await response.json();
}

export const getEmployeeByID = async (id, token) => {

  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch staff details");
  }

  return await response.json();
};

export const postStaff = async (staffData, token) => {

  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });

  if (!response.ok) throw new Error("Failed to add staff");

  return await response.json();
}

export const putStaff = async (id, updates, token) => {

  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error("Failed to update staff");

  return await response.json();
};

export const deleteStaff = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to delete staff");

    return await response.json();
  }
  catch (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
};
