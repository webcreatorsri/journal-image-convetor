import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Converter from "./pages/Converter";
import { auth } from "./firebase"; // Your Firebase config
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";
// eslint-disable-next-line no-unused-vars

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <div className="page-container"><h2>Loading...</h2></div>;

  return (
    <Router>
      <nav className="navbar">
        <h2>Journal Image Converter</h2>
        <div>
          {!user && (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>Register</NavLink>
            </>
          )}
          {user && (
            <>
              <NavLink to="/converter" className={({ isActive }) => isActive ? "active" : ""}>Converter</NavLink>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <div className="page-container">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/converter" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/converter" 
            element={user ? <Converter /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to={user ? "/converter" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}
