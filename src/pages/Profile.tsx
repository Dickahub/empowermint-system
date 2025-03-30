import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import { useAttendance } from "@/context/AttendanceContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar, Mail, Phone, MapPin, Briefcase, Calendar as CalendarIcon } from "lucide-react";
import PayrollSlip from "@/components/PayrollSlip";
import TaskSlip, { Task } from "@/components/TaskSlip";
import { toast } from "sonner";

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete quarterly report",
    description: "Prepare and submit the Q3 financial analysis report",
    assignedTo: "3", // Employee ID
    assignedBy: "2", // Manager ID
    dueDate: "2023-10-15",
    priority: "high",
    status: "in_progress",
    createdAt: "2023-09-28T10:00:00Z",
    updatedAt: "2023-10-01T14:30:00Z"
  },
  {
    id: "2",
    title: "Update client database",
    description: "Ensure all client information is current and accurate",
    assignedTo: "3", // Employee ID
    assignedBy: "1", // Admin ID
    dueDate: "2023-10-10",
    priority: "medium",
    status: "pending",
    createdAt: "2023-09-30T09:15:00Z",
    updatedAt: "2023-09-30T09:15:00Z"
  }
];

const mockPayrollItems = [
  { description: 'Transport Allowance', amount: 50000, type: 'earning' as const },
  { description: 'Performance Bonus', amount: 100000, type: 'earning' as const },
  { description: 'Health Insurance', amount: 25000, type: 'deduction' as const },
  { description: 'Income Tax', amount: 75000, type: 'deduction' as const },
  { description: 'Social Security', amount: 35000, type: 'deduction' as const },
];

const Profile = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { getEmployeeAttendance } = useAttendance();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  
  if (!user) {
    return <div>Loading...</div>;
  }

  const employeeRecord = employees.find(emp => emp.id === user.id);
  
  const attendanceRecords = getEmployeeAttendance(user.id);
  
  const sortedAttendanceRecords = [...attendanceRecords].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const recentAttendanceRecords = sortedAttendanceRecords.slice(0, 10);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };
  
  const calculateHours = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn || !clockOut) return "-";
    
    const [inHours, inMinutes] = clockIn.split(":").map(Number);
    const [outHours, outMinutes] = clockOut.split(":").map(Number);
    
    const inTime = inHours * 60 + inMinutes;
    const outTime = outHours * 60 + outMinutes;
    
    const diffMinutes = outTime - inTime;
    
    if (diffMinutes <= 0) return "-";
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-ems-success">Present</Badge>;
      case 'absent':
        return <Badge className="bg-ems-danger">Absent</Badge>;
      case 'late':
        return <Badge className="bg-ems-warning">Late</Badge>;
      case 'half_day':
        return <Badge variant="outline" className="text-ems-warning border-ems-warning">Half Day</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    toast.success("Task updated successfully");
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, task]);
    toast.success("Task added successfully");
  };

  const currentMonth = format(new Date(), "MMMM");
  const currentYear = format(new Date(), "yyyy");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader className="text-center">
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{employeeRecord?.position || user.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-ems-primary" />
                    <span>{user.email}</span>
                  </div>
                  
                  {employeeRecord?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-ems-primary" />
                      <span>{employeeRecord.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-ems-primary" />
                    <span>{employeeRecord?.department || user.department || "Not assigned"}</span>
                  </div>
                  
                  {employeeRecord?.joinDate && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-ems-primary" />
                      <span>Joined {formatDate(employeeRecord.joinDate)}</span>
                    </div>
                  )}
                  
                  {employeeRecord?.status && (
                    <div className="flex items-center">
                      <div className="h-4 w-4 mr-2" />
                      <Badge className={`
                        ${employeeRecord.status === 'active' ? 'bg-ems-success' : ''}
                        ${employeeRecord.status === 'inactive' ? 'bg-ems-danger' : ''}
                        ${employeeRecord.status === 'on_leave' ? 'bg-ems-warning' : ''}
                      `}>
                        {employeeRecord.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="attendance">
              <TabsList className="mb-4">
                <TabsTrigger value="attendance">Recent Attendance</TabsTrigger>
                <TabsTrigger value="info">Personal Information</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
              </TabsList>
              
              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance History</CardTitle>
                    <CardDescription>Your recent attendance records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentAttendanceRecords.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No attendance records found
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentAttendanceRecords.map((record) => (
                          <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-ems-primary" />
                              <div>
                                <div className="font-medium">{formatDate(record.date)}</div>
                                <div className="text-sm text-gray-500">
                                  {record.clockIn && `In: ${record.clockIn}`} 
                                  {record.clockIn && record.clockOut && " | "} 
                                  {record.clockOut && `Out: ${record.clockOut}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {record.clockIn && record.clockOut && (
                                <span className="text-sm">{calculateHours(record.clockIn, record.clockOut)}</span>
                              )}
                              {getStatusBadge(record.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <CardDescription>Your personal and employment details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-600 mb-2">Basic Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-500">Full Name</label>
                            <div className="font-medium">{user.name}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <div className="font-medium">{user.email}</div>
                          </div>
                          {employeeRecord?.phone && (
                            <div>
                              <label className="text-sm text-gray-500">Phone</label>
                              <div className="font-medium">{employeeRecord.phone}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-600 mb-2">Employment Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-500">Position</label>
                            <div className="font-medium">{employeeRecord?.position || "Not specified"}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Department</label>
                            <div className="font-medium">{employeeRecord?.department || "Not specified"}</div>
                          </div>
                          {employeeRecord?.joinDate && (
                            <div>
                              <label className="text-sm text-gray-500">Join Date</label>
                              <div className="font-medium">{formatDate(employeeRecord.joinDate)}</div>
                            </div>
                          )}
                          {employeeRecord?.salary && (
                            <div>
                              <label className="text-sm text-gray-500">Salary</label>
                              <div className="font-medium">{employeeRecord.salary.toLocaleString()} FCFA</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tasks">
                <TaskSlip
                  employeeId={user.id}
                  employeeName={user.name}
                  tasks={tasks.filter(task => task.assignedTo === user.id)}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskAdd={handleAddTask}
                />
              </TabsContent>
              
              <TabsContent value="payroll">
                <PayrollSlip
                  employeeName={user.name}
                  employeeId={user.id}
                  department={employeeRecord?.department || "Not assigned"}
                  position={employeeRecord?.position || "Not specified"}
                  month={currentMonth}
                  year={currentYear}
                  baseSalary={employeeRecord?.salary || 0}
                  items={mockPayrollItems}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
