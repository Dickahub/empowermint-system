
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import { useAttendance } from "@/context/AttendanceContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar, Clock, Mail, Phone, MapPin, Briefcase, Calendar as CalendarIcon } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { getEmployeeAttendance } = useAttendance();
  
  if (!user) {
    return <div>Loading...</div>;
  }

  // Get user's full employee record
  const employeeRecord = employees.find(emp => emp.id === user.id);
  
  // Get user's attendance history
  const attendanceRecords = getEmployeeAttendance(user.id);
  
  // Sort attendance records by date (most recent first)
  const sortedAttendanceRecords = [...attendanceRecords].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Get only the 10 most recent records
  const recentAttendanceRecords = sortedAttendanceRecords.slice(0, 10);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };
  
  // Calculate working hours (if both clockIn and clockOut are present)
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

  // Get status badge
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
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
                              <div className="font-medium">${employeeRecord.salary.toLocaleString()}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
