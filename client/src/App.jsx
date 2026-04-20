import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; // 🔥 ADD THIS

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* MAIN APP */}
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* 🔥 ADD THIS */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;