
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import { useAttendance } from "@/context/AttendanceContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, UserCheck, Users, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, isAdmin, isManager } = useAuth();
  const { employees } = useEmployees();
  const { attendanceRecords, clockIn, clockOut, getTodayAttendance } = useAttendance();

  // Get current user's attendance for today
  const todayAttendance = user ? getTodayAttendance(user.id) : undefined;
  const hasClockIn = todayAttendance?.checkIns?.length > 0;
  const hasClockOut = todayAttendance?.clockOut;

  // Calculate dashboard stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const onLeaveEmployees = employees.filter(emp => emp.status === 'on_leave').length;

  // Prepare chart data
  const departmentData = React.useMemo(() => {
    const departments: Record<string, number> = {};
    
    employees.forEach(employee => {
      if (departments[employee.department]) {
        departments[employee.department]++;
      } else {
        departments[employee.department] = 1;
      }
    });
    
    return Object.keys(departments).map(dept => ({
      name: dept,
      employees: departments[dept],
    }));
  }, [employees]);

  // Handler for clock in/out
  const handleClockInOut = () => {
    if (!user) return;
    
    if (!hasClockIn) {
      clockIn(user.id);
    } else if (!hasClockOut) {
      clockOut(user.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Employees
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                On Leave
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onLeaveEmployees}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {!hasClockIn ? (
                <Button 
                  className="w-full bg-ems-success hover:bg-green-600"
                  onClick={handleClockInOut}
                >
                  Clock In
                </Button>
              ) : !hasClockOut ? (
                <Button 
                  className="w-full bg-ems-warning hover:bg-amber-600"
                  onClick={handleClockInOut}
                >
                  Clock Out
                </Button>
              ) : (
                <div className="text-sm text-center">Completed for today</div>
              )}
              {hasClockIn && (
                <div className="mt-2 text-xs text-center text-gray-500">
                  In: {todayAttendance?.checkIns[0]?.time || 'Unknown'} {hasClockOut && `| Out: ${todayAttendance?.clockOut}`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {(isAdmin || isManager) && (
          <>
            <h2 className="text-xl font-semibold mt-6">Department Overview</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="employees" fill="#4299e1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        
        <h2 className="text-xl font-semibold mt-6">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center"
            onClick={() => window.location.href = '/profile'}
          >
            <UserCheck className="h-8 w-8 mb-2" />
            <span>View Profile</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center"
            onClick={() => window.location.href = '/attendance'}
          >
            <Clock className="h-8 w-8 mb-2" />
            <span>Attendance</span>
          </Button>
          
          {(isAdmin || isManager) && (
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/employees'}
            >
              <Users className="h-8 w-8 mb-2" />
              <span>Manage Employees</span>
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
