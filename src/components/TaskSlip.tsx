
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, AlertTriangle, XCircle, CalendarIcon, Pencil, Trash2, Clipboard, PlusCircle } from 'lucide-react';
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { 
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption 
} from "@/components/ui/table";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface TaskSlipProps {
  employeeId: string;
  employeeName: string;
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskAdd?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  readonly?: boolean;
}

const TaskSlip: React.FC<TaskSlipProps> = ({
  employeeId,
  employeeName,
  tasks,
  onTaskUpdate,
  onTaskAdd,
  readonly
}) => {
  const { user, isAdmin, isManager } = useAuth();
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: "low" | "medium" | "high";
  }>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });
  const [isAddingTask, setIsAddingTask] = useState(false);

  const canAddTasks = isAdmin || isManager;
  const canUpdateTasks = isAdmin || isManager || user?.id === employeeId;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    if (canUpdateTasks && onTaskUpdate) {
      onTaskUpdate(taskId, { 
        status, 
        updatedAt: new Date().toISOString() 
      });
    }
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) return;
    
    if (onTaskAdd && canAddTasks && user) {
      onTaskAdd({
        title: newTask.title,
        description: newTask.description,
        assignedTo: employeeId,
        assignedBy: user.id,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        status: 'pending'
      });
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium'
      });
      
      setIsAddingTask(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl">
          <Clipboard className="h-5 w-5 inline mr-2" />
          Tasks for {employeeName}
        </CardTitle>
        {canAddTasks && onTaskAdd && (
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Task title"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select 
                      value={newTask.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({
                        ...newTask, 
                        priority: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>
                  Assign Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No tasks assigned yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                {canUpdateTasks && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground">{task.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  {canUpdateTasks && (
                    <TableCell>
                      {user?.id === employeeId && task.status !== 'completed' && task.status !== 'cancelled' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      )}
                      
                      {(isAdmin || isManager) && task.status !== 'cancelled' && (
                        <Select 
                          value={task.status}
                          onValueChange={(value) => updateTaskStatus(
                            task.id, 
                            value as 'pending' | 'in_progress' | 'completed' | 'cancelled'
                          )}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskSlip;
