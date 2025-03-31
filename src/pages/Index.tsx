
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Redirect to the appropriate page
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'manager') {
        navigate("/dashboard");
      } else {
        // Direct regular employees to their profile page
        navigate("/profile");
      }
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <div className="w-8 h-8 border-4 border-ems-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
