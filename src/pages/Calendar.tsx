
import React, { useState } from "react";
import { format, isToday, parseISO, isValid, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";

type Event = {
  id: string;
  title: string;
  date: string;
  type: "meeting" | "holiday" | "leave" | "training";
  employees?: string[];
  description?: string;
};

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Réunion d'équipe",
    date: "2023-06-15",
    type: "meeting",
    employees: ["1", "2", "3"],
    description: "Réunion hebdomadaire pour discuter des progrès du projet"
  },
  {
    id: "2",
    title: "Formation professionnelle",
    date: "2023-06-20",
    type: "training",
    employees: ["2", "4"],
    description: "Formation sur les nouvelles technologies"
  },
  {
    id: "3",
    title: "Jour férié - Fête Nationale",
    date: "2023-05-20",
    type: "holiday",
    description: "Fête Nationale du Cameroun"
  },
  {
    id: "4",
    title: "Congé annuel",
    date: "2023-06-10",
    type: "leave",
    employees: ["3"],
    description: "Congé annuel approuvé"
  }
];

const Calendar = () => {
  const { user, isAdmin, isManager } = useAuth();
  const { employees } = useEmployees();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<string>("all");
  
  const getEmployeeName = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    return employee ? employee.name : "Inconnu";
  };
  
  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesDate = selectedDate 
        ? format(selectedDate, "yyyy-MM-dd") === event.date 
        : true;
      const matchesType = filterType !== "all" ? event.type === filterType : true;
      return matchesDate && matchesType;
    });
  };
  
  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "holiday":
        return "bg-red-100 text-red-800 border-red-200";
      case "leave":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "training":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getEventBadge = (type: string) => {
    switch (type) {
      case "meeting":
        return <Badge className="bg-blue-500">Réunion</Badge>;
      case "holiday":
        return <Badge className="bg-red-500">Férié</Badge>;
      case "leave":
        return <Badge className="bg-amber-500">Congé</Badge>;
      case "training":
        return <Badge className="bg-green-500">Formation</Badge>;
      default:
        return <Badge>Autre</Badge>;
    }
  };
  
  const handlePrevMonth = () => {
    setDisplayMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setDisplayMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const getDayContent = (day: Date) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    const dayEvents = events.filter(event => event.date === formattedDate);
    
    return (
      <div className="relative h-full w-full p-2">
        <div className="text-center">{format(day, "d")}</div>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
            <div className="flex space-x-1">
              {dayEvents.length > 3 ? (
                <Badge className="bg-gray-500 text-[10px]">{dayEvents.length}</Badge>
              ) : (
                dayEvents.map((event, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full ${
                      event.type === "meeting" ? "bg-blue-500" :
                      event.type === "holiday" ? "bg-red-500" : 
                      event.type === "leave" ? "bg-amber-500" :
                      "bg-green-500"
                    }`}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
          
          {(isAdmin || isManager) && (
            <Button className="bg-ems-primary">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Ajouter un événement
            </Button>
          )}
        </div>
        
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <div>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Calendrier</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={displayMonth}
                  onMonthChange={setDisplayMonth}
                  locale={fr}
                  className="rounded-md border"
                />
                
                <div className="mt-6 space-y-2">
                  <div className="text-sm font-medium">Filtrer par type</div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="meeting">Réunions</SelectItem>
                      <SelectItem value="holiday">Jours fériés</SelectItem>
                      <SelectItem value="leave">Congés</SelectItem>
                      <SelectItem value="training">Formations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Légende</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      <span className="text-sm">Réunion</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                      <span className="text-sm">Jour férié</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                      <span className="text-sm">Congé</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                      <span className="text-sm">Formation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {selectedDate 
                    ? `Événements: ${format(selectedDate, "d MMMM yyyy", { locale: fr })}`
                    : "Tous les événements"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredEvents().length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      Aucun événement {selectedDate ? "pour cette date" : ""} {filterType && "de ce type"}
                    </div>
                  ) : (
                    getFilteredEvents().map(event => (
                      <div 
                        key={event.id} 
                        className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm mt-1">{event.description}</div>
                            <div className="mt-2">
                              {getEventBadge(event.type)}
                              <span className="ml-2 text-xs">
                                {format(parseISO(event.date), "d MMMM yyyy", { locale: fr })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {event.employees && event.employees.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-500 mb-1">Participants:</div>
                            <div className="flex -space-x-2">
                              {event.employees.map(empId => (
                                <Avatar key={empId} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="text-[10px]">
                                    {getEmployeeName(empId).charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
