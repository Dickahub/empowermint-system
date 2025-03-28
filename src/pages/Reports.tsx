
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEmployees } from "@/context/EmployeeContext";
import { useAttendance } from "@/context/AttendanceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, PieChart, LineChart, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Pie, Cell, ResponsiveContainer } from 'recharts';
import { format, subMonths, differenceInMonths, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Reports = () => {
  const { employees } = useEmployees();
  const { attendanceRecords } = useAttendance();
  const [timeRange, setTimeRange] = useState("3months");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Department data
  const departments = Array.from(new Set(employees.map(emp => emp.department)));
  
  // Calculate date range for filtering
  const getDateRange = () => {
    const today = new Date();
    
    switch (timeRange) {
      case "1month":
        return subMonths(today, 1);
      case "3months":
        return subMonths(today, 3);
      case "6months":
        return subMonths(today, 6);
      case "12months":
        return subMonths(today, 12);
      default:
        return subMonths(today, 3);
    }
  };
  
  const dateRangeStart = getDateRange();

  // Filter employees by department
  const filteredEmployees = departmentFilter
    ? employees.filter(emp => emp.department === departmentFilter)
    : employees;

  // Filter attendance records by date range
  const filteredAttendance = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= dateRangeStart;
  });

  // DEPARTMENT DISTRIBUTION DATA
  const departmentDistributionData = React.useMemo(() => {
    const deptCounts: Record<string, number> = {};
    
    filteredEmployees.forEach(employee => {
      if (deptCounts[employee.department]) {
        deptCounts[employee.department]++;
      } else {
        deptCounts[employee.department] = 1;
      }
    });
    
    return Object.keys(deptCounts).map(dept => ({
      name: dept,
      value: deptCounts[dept],
    }));
  }, [filteredEmployees]);

  // ATTENDANCE STATUS DATA
  const attendanceStatusData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {
      present: 0,
      absent: 0,
      late: 0,
      half_day: 0,
    };
    
    filteredAttendance.forEach(record => {
      if (statusCounts[record.status] !== undefined) {
        statusCounts[record.status]++;
      }
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status.replace('_', ' '),
      value: statusCounts[status],
    }));
  }, [filteredAttendance]);

  // MONTHLY ATTENDANCE TRENDS
  const monthlyAttendanceTrends = React.useMemo(() => {
    const months: Record<string, { present: number; absent: number; late: number; half_day: number }> = {};
    
    // Initialize months
    const today = new Date();
    for (let i = 0; i <= differenceInMonths(today, dateRangeStart); i++) {
      const monthDate = subMonths(today, i);
      const monthKey = format(monthDate, "MMM yyyy");
      months[monthKey] = { present: 0, absent: 0, late: 0, half_day: 0 };
    }
    
    // Populate data
    filteredAttendance.forEach(record => {
      const recordDate = new Date(record.date);
      const monthKey = format(recordDate, "MMM yyyy");
      
      if (months[monthKey] && months[monthKey][record.status as keyof typeof months[typeof monthKey]] !== undefined) {
        months[monthKey][record.status as keyof typeof months[typeof monthKey]]++;
      }
    });
    
    // Convert to array and sort chronologically
    return Object.keys(months)
      .map(month => ({
        name: month,
        ...months[month],
      }))
      .reverse();
  }, [filteredAttendance, dateRangeStart]);
  
  // COLORS FOR CHARTS
  const COLORS = ['#1a365d', '#2a4365', '#4299e1', '#ebf8ff', '#48bb78', '#ed8936', '#f56565'];

  // Export data function (mock)
  const handleExportData = (reportType: string) => {
    toast.success(`Exporting ${reportType} report`);
    // In a real app, this would generate and download a CSV or PDF file
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="attendance">
          <TabsList className="mb-4">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Attendance Overview</CardTitle>
                    <CardDescription>Distribution of attendance statuses</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => handleExportData('attendance')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {attendanceStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Attendance Stats</CardTitle>
                    <CardDescription>Summary of attendance records</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendanceStatusData.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          <span className="capitalize">{item.name}</span>
                        </div>
                        <div className="font-medium">{item.value}</div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Records</span>
                        <span className="font-medium">
                          {attendanceStatusData.reduce((sum, item) => sum + item.value, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="departments">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Department Distribution</CardTitle>
                    <CardDescription>Employee count by department</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => handleExportData('departments')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentDistributionData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 70,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          tick={{ fontSize: 12 }}
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Employees" fill="#4299e1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Department Summary</CardTitle>
                  <CardDescription>Employee counts and percentages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentDistributionData.map((item, index) => {
                      const percentage = (item.value / filteredEmployees.length * 100).toFixed(1);
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                            />
                            <span>{item.name}</span>
                          </div>
                          <div className="font-medium">{item.value} ({percentage}%)</div>
                        </div>
                      );
                    })}
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Employees</span>
                        <span className="font-medium">
                          {filteredEmployees.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>Monthly attendance patterns</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={() => handleExportData('trends')}>
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyAttendanceTrends}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="present" 
                        name="Present" 
                        stroke="#48bb78" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="absent" 
                        name="Absent" 
                        stroke="#f56565" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="late" 
                        name="Late" 
                        stroke="#ed8936" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="half_day" 
                        name="Half Day" 
                        stroke="#4299e1" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
