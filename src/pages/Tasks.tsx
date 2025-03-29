
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { useEmployees } from '@/context/EmployeeContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TaskSlip from '@/components/TaskSlip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { User, ClipboardList } from 'lucide-react';

const Tasks = () => {
  const { user, isAdmin, isManager } = useAuth();
  const { tasks, getEmployeeTasks, getAssignedTasks, addTask, updateTask, deleteTask } = useTasks();
  const { employees } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // If the user is not an admin or manager, set the selected employee to the current user
  useEffect(() => {
    if (!isAdmin && !isManager && user) {
      setSelectedEmployeeId(user.id);
    }
  }, [user, isAdmin, isManager]);

  // Get the selected employee object
  const selectedEmployee = selectedEmployeeId 
    ? employees.find(emp => emp.id === selectedEmployeeId) 
    : null;

  // Get tasks for the selected employee
  const employeeTasks = selectedEmployeeId 
    ? getEmployeeTasks(selectedEmployeeId)
    : [];

  // Get tasks assigned by the current user (for managers/admins)
  const assignedTasks = user ? getAssignedTasks(user.id) : [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Employee selector for admins and managers */}
          {(isAdmin || isManager) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Employees</SelectLabel>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position || employee.role}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
          
          {/* Display tasks for selected employee */}
          {selectedEmployeeId && selectedEmployee && (
            <TaskSlip
              employeeId={selectedEmployeeId}
              employeeName={selectedEmployee.name}
              tasks={employeeTasks}
              onTaskUpdate={updateTask}
              onTaskAdd={addTask}
            />
          )}
          
          {/* For non-admin/manager users, show their own tasks */}
          {!isAdmin && !isManager && user && (
            <TaskSlip
              employeeId={user.id}
              employeeName={user.name}
              tasks={getEmployeeTasks(user.id)}
              onTaskUpdate={updateTask}
              readonly={false}
            />
          )}
          
          {/* For managers/admins, show tasks they have assigned */}
          {(isAdmin || isManager) && user && assignedTasks.length > 0 && !selectedEmployeeId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Tasks You've Assigned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {assignedTasks.map(task => {
                    const assignedToEmployee = employees.find(emp => emp.id === task.assignedTo);
                    return (
                      <li key={task.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Assigned to: {assignedToEmployee?.name || 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Show message if no employee is selected for admin/manager */}
          {(isAdmin || isManager) && !selectedEmployeeId && assignedTasks.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select an employee to manage their tasks</p>
              <p>Or assign new tasks to employees</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
