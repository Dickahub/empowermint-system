import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, CheckCircle2, XCircle, AlertTriangle, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format, differenceInBusinessDays, addDays } from 'date-fns';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export interface Leave {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'personal' | 'bereavement' | 'unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface LeaveManagementProps {
  employeeId?: string;
  employeeName?: string;
  leaves: Leave[];
  onLeaveAdd?: (leave: Omit<Leave, 'id' | 'createdAt'>) => void;
  onLeaveUpdate?: (leaveId: string, status: 'approved' | 'rejected') => void;
  isManagerView?: boolean;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({
  employeeId,
  employeeName,
  leaves,
  onLeaveAdd,
  onLeaveUpdate,
  isManagerView = false
}) => {
  const { user, isAdmin, isManager } = useAuth();
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [newLeave, setNewLeave] = useState<{
    type: 'annual' | 'sick' | 'personal' | 'bereavement' | 'unpaid';
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const canRequestLeave = onLeaveAdd && (isManagerView ? false : true);
  const canApproveLeave = isManagerView && (isAdmin || isManager) && onLeaveUpdate;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'annual':
        return <Badge className="bg-blue-500">Annual Leave</Badge>;
      case 'sick':
        return <Badge className="bg-yellow-500">Sick Leave</Badge>;
      case 'personal':
        return <Badge className="bg-purple-500">Personal Leave</Badge>;
      case 'bereavement':
        return <Badge className="bg-gray-500">Bereavement</Badge>;
      case 'unpaid':
        return <Badge variant="outline">Unpaid Leave</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return differenceInBusinessDays(end, start) + 1;
  };

  const handleAddLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason || !employeeId) return;
    
    if (onLeaveAdd) {
      onLeaveAdd({
        employeeId,
        type: newLeave.type,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        reason: newLeave.reason,
        status: 'pending'
      });
      
      setNewLeave({
        type: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
      });
      
      setIsAddingLeave(false);
    }
  };

  const handleUpdateLeaveStatus = (leaveId: string, status: 'approved' | 'rejected') => {
    if (canApproveLeave && onLeaveUpdate) {
      onLeaveUpdate(leaveId, status);
    }
  };

  const displayLeaves = isManagerView && !employeeId 
    ? leaves 
    : leaves.filter(leave => leave.employeeId === employeeId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl">
          {isManagerView && !employeeId ? 'Employee Leave Requests' : `Leave Requests for ${employeeName || 'You'}`}
        </CardTitle>
        {canRequestLeave && (
          <Dialog open={isAddingLeave} onOpenChange={setIsAddingLeave}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
                <DialogDescription>
                  Submit your leave request for approval
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select 
                    value={newLeave.type}
                    onValueChange={(value: 'annual' | 'sick' | 'personal' | 'bereavement' | 'unpaid') => 
                      setNewLeave({...newLeave, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                      <SelectItem value="bereavement">Bereavement</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    />
                  </div>
                </div>
                
                {newLeave.startDate && newLeave.endDate && (
                  <div className="text-sm text-muted-foreground">
                    Duration: {calculateDuration(newLeave.startDate, newLeave.endDate)} working days
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                    placeholder="Please provide a reason for your leave request"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingLeave(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddLeave}>
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent>
        {displayLeaves.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No leave requests found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {isManagerView && <TableHead>Employee</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                {canApproveLeave && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  {isManagerView && (
                    <TableCell>
                      {/* In a real app, we'd look up the employee name */}
                      Employee #{leave.employeeId}
                    </TableCell>
                  )}
                  <TableCell>{getLeaveTypeBadge(leave.type)}</TableCell>
                  <TableCell>{calculateDuration(leave.startDate, leave.endDate)} days</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" /> 
                        {new Date(leave.startDate).toLocaleDateString()}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        to {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={leave.reason}>
                      {leave.reason}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  {canApproveLeave && leave.status === 'pending' && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-50 hover:bg-green-100 text-green-700"
                          onClick={() => handleUpdateLeaveStatus(leave.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-700"
                          onClick={() => handleUpdateLeaveStatus(leave.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {canApproveLeave && leave.status !== 'pending' && (
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {leave.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
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

export default LeaveManagement;
