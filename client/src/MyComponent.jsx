import React from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext,jsx";

const MyComponent = () => {
  const { getToken, user } = useAuth();

  const callProtectedApi = async () => {
    if (!user) return alert("Please login first");

    const token = await getToken(); // get Firebase JWT
    try {
      const res = await axios.get("https://ai-career-advisor-a0f5.onrender.com/api/protected", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Protected API response:", res.data);
    } catch (err) {
      console.error("Error calling protected API:", err.response?.data || err.message);
    }
  };

  return <button onClick={callProtectedApi}>Call Protected API</button>;
};

export default MyComponent;
