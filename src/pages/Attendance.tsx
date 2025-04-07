
import React, { useState } from "react";
import { useAttendance } from "@/context/AttendanceContext";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Check, X, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Attendance = () => {
  const { user, isAdmin, isManager } = useAuth();
  const { attendanceRecords, clockIn, clockOut, checkIn } = useAttendance();
  const { employees } = useEmployees();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [employeeFilter, setEmployeeFilter] = useState<string>(user?.id || "all");

  // Helper to get the formatted date
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  // Get employee name by ID
  const getEmployeeName = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    return employee ? employee.name : "Unknown";
  };

  // Filter attendance records based on date and employee filter
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesDate = record.date === formattedDate;
    const matchesEmployee = employeeFilter === "all" || record.employeeId === employeeFilter;
    return matchesDate && matchesEmployee;
  });

  // Check if current user has clocked in/out for the selected date
  const userRecord = user && attendanceRecords.find(
    record => record.employeeId === user.id && record.date === formattedDate
  );
  const hasClockIn = userRecord?.checkIns?.length > 0 || false;
  const hasClockOut = userRecord?.clockOut ? true : false;

  // Handler for clock in/out
  const handleClockInOut = () => {
    if (!user) return;
    
    if (!hasClockIn) {
      clockIn(user.id);
    } else if (!hasClockOut) {
      clockOut(user.id);
    }
  };

  // Handler for regular check-in
  const handleCheckIn = () => {
    if (!user) return;
    checkIn(user.id);
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
        return <Badge variant="outline" className="text-ems-warning border-ems-warning">Half-day</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date for display
  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "d MMMM yyyy");
  };

  // Check if date is today
  const isToday = selectedDate ? format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          
          {isToday && (
            <div className="flex gap-2">
              <Button 
                onClick={handleClockInOut}
                className={hasClockIn ? (hasClockOut ? "bg-gray-400" : "bg-ems-warning") : "bg-ems-success"}
                disabled={hasClockOut}
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

              {hasClockIn && !hasClockOut && (
                <Button
                  onClick={handleCheckIn}
                  variant="outline"
                  className="border-ems-accent text-ems-accent"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Regular Check-in
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate ? formatDisplayDate(selectedDate) : "Select a date"}
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
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
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
                <TableHead>Regular Check-ins</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No attendance records found for this date
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getEmployeeName(record.employeeId).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{getEmployeeName(record.employeeId)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.checkIns && record.checkIns.length > 0 ? (
                        <span className="flex items-center text-ems-success">
                          <Check className="mr-1 h-4 w-4" /> 
                          {record.checkIns[0].time}
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <X className="mr-1 h-4 w-4" /> 
                          Not clocked in
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.checkIns && record.checkIns.length > 1 ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium">{record.checkIns.length - 1} check-ins</div>
                          <div className="flex flex-wrap gap-1">
                            {record.checkIns.slice(1).map((checkIn, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1">
                                {checkIn.time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
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
