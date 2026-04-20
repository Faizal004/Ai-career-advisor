import axios from "axios";
import { useAuth } from "./contexts/AuthContext";

const MyComponent = () => {
  const { getToken, user } = useAuth();

  const callProtectedApi = async () => {
    if (!user) return alert("Please login first");
    const token = await getToken();
    const res = await axios.get("http://localhost:5000/api/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(res.data);
  };

  return <button onClick={callProtectedApi}>Call protected API</button>;
};

export default MyComponent;
