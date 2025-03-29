
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { AttendanceProvider } from "@/context/AttendanceContext";
import { TaskProvider } from "@/context/TaskContext";
import { LeaveProvider } from "@/context/LeaveContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";

const queryClient = new QueryClient();

// Route guard for authenticated routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Route guard for admin-only routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Route guard for manager/admin routes
const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isManager } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isManager) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      <Route path="/" element={<Index />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/employees" 
        element={
          <ManagerRoute>
            <Employees />
          </ManagerRoute>
        } 
      />
      
      <Route 
        path="/attendance" 
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/leaves" 
        element={
          <ManagerRoute>
            <Leaves />
          </ManagerRoute>
        } 
      />
      
      <Route 
        path="/payroll" 
        element={
          <ManagerRoute>
            <Payroll />
          </ManagerRoute>
        } 
      />
      
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reports" 
        element={
          <AdminRoute>
            <Reports />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <EmployeeProvider>
          <AttendanceProvider>
            <TaskProvider>
              <LeaveProvider>
                <Toaster />
                <SonnerToaster position="top-right" />
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </LeaveProvider>
            </TaskProvider>
          </AttendanceProvider>
        </EmployeeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
