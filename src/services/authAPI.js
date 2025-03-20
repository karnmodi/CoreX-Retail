const API_BASE_URL = import.meta.env.VITE_API_URL

export const getUserData = async (token, uid) => {
  console.log("📡 Fetching user data for UID:", uid);

  const response = await fetch(`${API_BASE_URL}/employees/${uid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch user data");
  
  console.log("✅ Received user data:", data);
  return data;
};
