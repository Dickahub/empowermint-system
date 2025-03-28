
import React, { useState } from "react";
import { useAttendance } from "@/context/AttendanceContext";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Check, X, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Attendance = () => {
  const { user, isAdmin, isManager } = useAuth();
  const { attendanceRecords, clockIn, clockOut } = useAttendance();
  const { employees } = useEmployees();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [employeeFilter, setEmployeeFilter] = useState<string>(user?.id || "");

  // Helper to get the formatted date
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  // Get employee name by ID
  const getEmployeeName = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    return employee ? employee.name : "Unknown";
  };

  // Get employee avatar by ID
  const getEmployeeAvatar = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    return employee?.avatar;
  };

  // Filter attendance records based on date and employee filter
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesDate = record.date === formattedDate;
    const matchesEmployee = !employeeFilter || record.employeeId === employeeFilter;
    return matchesDate && matchesEmployee;
  });

  // Check if current user has clocked in/out for the selected date
  const userRecord = user && attendanceRecords.find(
    record => record.employeeId === user.id && record.date === formattedDate
  );
  const hasClockIn = userRecord?.clockIn ? true : false; // Convert to boolean
  const hasClockOut = userRecord?.clockOut ? true : false; // Convert to boolean

  // Handler for clock in/out
  const handleClockInOut = () => {
    if (!user) return;
    
    if (!hasClockIn) {
      clockIn(user.id);
    } else if (!hasClockOut) {
      clockOut(user.id);
    }
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

  // Format date for display
  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "MMMM d, yyyy");
  };

  // Check if date is today
  const isToday = selectedDate ? format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          
          {isToday && (
            <Button 
              onClick={handleClockInOut}
              className={hasClockIn ? (hasClockOut ? "bg-gray-400" : "bg-ems-warning") : "bg-ems-success"}
              disabled={hasClockIn && hasClockOut}
            >
              {!hasClockIn ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Clock In
                </>
              ) : !hasClockOut ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Clock Out
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Completed
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate ? formatDisplayDate(selectedDate) : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {isToday && (
              <Badge className="bg-ems-accent">Today</Badge>
            )}
          </div>
          
          {(isAdmin || isManager) && (
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="bg-white rounded-md shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No attendance records found for this date
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={getEmployeeAvatar(record.employeeId)} alt={getEmployeeName(record.employeeId)} />
                          <AvatarFallback>{getEmployeeName(record.employeeId).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{getEmployeeName(record.employeeId)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.clockIn ? (
                        <span className="flex items-center text-ems-success">
                          <Check className="mr-1 h-4 w-4" /> 
                          {record.clockIn}
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <X className="mr-1 h-4 w-4" /> 
                          Not clocked in
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.clockOut ? (
                        <span className="flex items-center text-ems-success">
                          <Check className="mr-1 h-4 w-4" /> 
                          {record.clockOut}
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <X className="mr-1 h-4 w-4" /> 
                          Not clocked out
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.notes ? (
                        <span>{record.notes}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
