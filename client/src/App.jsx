import React, { useContext } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./components/ThemeToggle";
import AccountBadge from "./components/AccountBadge";
import assets from "./assets/assets";

const App = () => {
  const { authUser, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return (
    <div className="flex items-center justify-center h-screen dark:bg-dark-bg bg-light-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="dark:bg-dark-bg bg-light-bg min-h-screen transition-colors duration-300">
      {/* Branding - top-left (only show before login to avoid duplication with Sidebar) */}
      {!authUser && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-3 select-none">
          <div className="neon-avatar w-10 h-10 grid place-items-center rounded-xl">
            <img src={assets.logo_icon} alt="ConvoFlow" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-extrabold neon-text text-lg">ConvoFlow</span>
        </div>
      )}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
  {authUser && location.pathname !== '/profile' && <AccountBadge />}
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'dark:bg-dark-secondary dark:text-white bg-light-secondary',
        }}
      />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;