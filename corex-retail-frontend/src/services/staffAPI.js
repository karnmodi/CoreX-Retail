
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getAllEmployees = async (token) => {

  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to fetch employees: ${errorDetails}`);
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
  try {
    if (!staffData || Object.keys(staffData).length === 0) {
      console.error("🚨 Error: staffData is empty before sending to API!", staffData);
      throw new Error("Cannot send empty staff data");
    }

    console.log("✅ Sending Staff Data to API:", JSON.stringify(staffData, null, 2));

    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData), // Ensure the request is properly formatted
    });

    console.log("✅ API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(errorText || "Failed to add staff");
    }

    const data = await response.json();
    console.log("✅ API Response Data:", data);

    return data;
  } catch (error) {
    console.error("❌ Error in postStaff:", error.message);
    throw error;
  }
};


export const putStaff = async (id, updates, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text(); 
      throw new Error(errorText || "Failed to update staff");
    }
    return  updates;
    
  } catch (error) {
    console.error("Error updating staff:", error.message);
    throw error;
  }
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
