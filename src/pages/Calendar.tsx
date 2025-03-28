
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useAttendance } from "@/context/AttendanceContext";
import { useEmployees } from "@/context/EmployeeContext";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isSameDay, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Calendar = () => {
  const { user } = useAuth();
  const { attendanceRecords } = useAttendance();
  const { employees } = useEmployees();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{title: string, date: Date, records: any[]}>({
    title: "",
    date: new Date(),
    records: []
  });

  // For demo purposes, let's create some scheduled events
  const events = [
    { 
      title: "Team Meeting", 
      date: format(addDays(new Date(), 2), "yyyy-MM-dd"), 
      time: "10:00 - 11:30",
      attendees: ["1", "2", "3", "5"]
    },
    { 
      title: "Project Review", 
      date: format(addDays(new Date(), 4), "yyyy-MM-dd"), 
      time: "14:00 - 15:00",
      attendees: ["1", "2", "4"]
    },
    { 
      title: "Training Session", 
      date: format(addDays(new Date(), 1), "yyyy-MM-dd"), 
      time: "09:00 - 12:00",
      attendees: ["3", "4", "5"]
    },
    { 
      title: "Department Lunch", 
      date: format(addDays(new Date(), 3), "yyyy-MM-dd"), 
      time: "12:30 - 14:00",
      attendees: ["1", "2", "3", "4", "5"]
    },
    { 
      title: "Quarterly Planning", 
      date: format(addDays(new Date(), 7), "yyyy-MM-dd"), 
      time: "09:00 - 17:00",
      attendees: ["1", "2"]
    },
    { 
      title: "Client Meeting", 
      date: format(subDays(new Date(), 1), "yyyy-MM-dd"), 
      time: "15:00 - 16:00",
      attendees: ["2", "5"]
    }
  ];

  // Function to check if a date has events
  const hasEvents = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return events.some(event => event.date === formattedDate);
  };

  // Function to check if a date has attendance
  const hasAttendance = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return attendanceRecords.some(record => record.date === formattedDate && record.employeeId === user?.id);
  };

  // Function to get events for a specific date
  const getEvents = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return events.filter(event => event.date === formattedDate);
  };

  // Function to get attendance for a specific date
  const getAttendance = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return attendanceRecords.filter(record => record.date === formattedDate);
  };

  // Date renderer for the calendar
  const dateRenderer = (date: Date, view: "month" | "year") => {
    if (view === "month") {
      const dayHasEvents = hasEvents(date);
      const dayHasAttendance = hasAttendance(date);
      
      return (
        <div className="relative">
          <time dateTime={format(date, "yyyy-MM-dd")}>
            {format(date, "d")}
          </time>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
            {dayHasEvents && (
              <div className="h-1 w-1 rounded-full bg-ems-accent" />
            )}
            {dayHasAttendance && (
              <div className="h-1 w-1 rounded-full bg-ems-success" />
            )}
          </div>
        </div>
      );
    }
    return date.getDate();
  };

  // Handler for date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    
    const dateEvents = getEvents(date);
    const dateAttendance = getAttendance(date);
    
    setDialogContent({
      title: format(date, "MMMM d, yyyy"),
      date: date,
      records: [...dateEvents.map(event => ({ ...event, type: 'event' })), ...dateAttendance.map(record => ({ ...record, type: 'attendance' }))]
    });
    
    if (dateEvents.length > 0 || dateAttendance.length > 0) {
      setDialogOpen(true);
    }
  };

  const formatDisplayDate = (date: Date) => {
    return format(date, "MMMM yyyy");
  };

  // Get events for the selected day to display in the main view
  const selectedDateEvents = selectedDate ? getEvents(selectedDate) : [];
  const selectedDateFormatted = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  
  // Get user's attendance for the selected day
  const userAttendance = user && selectedDate
    ? attendanceRecords.find(
        record => record.employeeId === user.id && record.date === selectedDateFormatted
      )
    : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Calendar & Schedule</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>View your schedule and attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-medium">{formatDisplayDate(date)}</div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setDate(prevDate => subDays(prevDate, 30))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setDate(prevDate => addDays(prevDate, 30))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateClick}
                  month={date}
                  onMonthChange={setDate}
                  className="rounded-md border"
                  components={{
                    Day: ({ date, ...props }) => (
                      <button 
                        {...props} 
                        className={`${props.className} ${isToday(date) ? "bg-ems-accent text-white hover:bg-ems-accent hover:text-white focus:bg-ems-accent focus:text-white" : ""}`}
                      >
                        {dateRenderer(date, "month")}
                      </button>
                    )
                  }}
                />
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-ems-accent mr-2" />
                    <span>Events</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-ems-success mr-2" />
                    <span>Attendance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select a day"}
                  </CardTitle>
                  {selectedDate && isToday(selectedDate) && (
                    <Badge className="bg-ems-accent">Today</Badge>
                  )}
                </div>
                <CardDescription>
                  {selectedDate ? `Schedule for ${format(selectedDate, "EEEE")}` : "Click on a date to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate && (
                  <div className="space-y-4">
                    {userAttendance && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center text-ems-primary mb-1 font-medium">
                          <Clock className="h-4 w-4 mr-2" />
                          Attendance
                        </div>
                        <div className="text-sm">
                          {userAttendance.clockIn && (
                            <div className="flex justify-between">
                              <span>Clock In:</span>
                              <span className="font-medium">{userAttendance.clockIn}</span>
                            </div>
                          )}
                          {userAttendance.clockOut && (
                            <div className="flex justify-between">
                              <span>Clock Out:</span>
                              <span className="font-medium">{userAttendance.clockOut}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className={`
                              ${userAttendance.status === 'present' ? 'bg-ems-success' : ''}
                              ${userAttendance.status === 'absent' ? 'bg-ems-danger' : ''}
                              ${userAttendance.status === 'late' ? 'bg-ems-warning' : ''}
                              ${userAttendance.status === 'half_day' ? 'border-ems-warning text-ems-warning' : ''}
                            `}>
                              {userAttendance.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDateEvents.length > 0 ? (
                      <div>
                        <h3 className="font-medium mb-2">Events</h3>
                        <div className="space-y-3">
                          {selectedDateEvents.map((event, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-md">
                              <div className="font-medium text-ems-primary">{event.title}</div>
                              <div className="text-sm flex justify-between items-center mt-1">
                                <div className="flex items-center text-gray-600">
                                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                  {event.time}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-3.5 w-3.5 mr-1" />
                                  {event.attendees.length}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No events scheduled for this day
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Details for {dialogContent.title}</DialogTitle>
            <DialogDescription>
              Events and attendance records for this day
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {dialogContent.records
              .filter(record => record.type === 'event')
              .map((event, index) => (
                <div key={`event-${index}`} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-ems-accent" />
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.time}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex items-start">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div className="text-gray-500">Attendees:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.attendees.map((attendeeId: string) => {
                            const employee = employees.find(emp => emp.id === attendeeId);
                            return employee ? (
                              <Badge key={attendeeId} variant="outline" className="font-normal">
                                {employee.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            
            {dialogContent.records
              .filter(record => record.type === 'attendance')
              .map((record, index) => {
                const employee = employees.find(emp => emp.id === record.employeeId);
                return (
                  <div key={`attendance-${index}`} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-ems-success" />
                      <div>
                        <div className="font-medium">{employee?.name || 'Unknown Employee'}</div>
                        <div className="text-sm space-x-2">
                          {record.clockIn && <span>In: {record.clockIn}</span>}
                          {record.clockOut && <span>Out: {record.clockOut}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {record.notes && (
                          <div className="flex items-start">
                            <Info className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{record.notes}</span>
                          </div>
                        )}
                      </div>
                      <Badge className={`
                        ${record.status === 'present' ? 'bg-ems-success' : ''}
                        ${record.status === 'absent' ? 'bg-ems-danger' : ''}
                        ${record.status === 'late' ? 'bg-ems-warning' : ''}
                        ${record.status === 'half_day' ? 'border-ems-warning text-ems-warning' : ''}
                      `}>
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
            {dialogContent.records.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No records for this day
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Calendar;
