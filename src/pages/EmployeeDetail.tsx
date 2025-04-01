import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import { useLeaves } from "@/context/LeaveContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Briefcase } from "lucide-react";
import PayrollSlip from "@/components/PayrollSlip";
import LeaveManagement from "@/components/LeaveManagement";
import PerformanceRating from "@/components/PerformanceRating";

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEmployee } = useEmployees();
  const { isAdmin, isManager } = useAuth();
  const { leaves, addLeave, updateLeaveStatus } = useLeaves();
  
  const employee = getEmployee(id || "");
  
  if (!employee) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/employees")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Employee Not Found</h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p>The requested employee does not exist or has been removed.</p>
              <Button 
                className="mt-4"
                onClick={() => navigate("/employees")}
              >
                Back to Employees
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const employeeLeaves = leaves.filter(leave => leave.employeeId === employee.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-ems-success">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-ems-danger">Inactive</Badge>;
      case 'on_leave':
        return <Badge className="bg-ems-warning">On Leave</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleLeaveRequest = (leaveData: Omit<any, 'id' | 'createdAt'>) => {
    addLeave(leaveData);
  };

  const handleLeaveUpdate = (leaveId: string, status: 'approved' | 'rejected') => {
    updateLeaveStatus(leaveId, status);
  };

  const mockPayrollItems = [
    { description: 'Transport Allowance', amount: 35000, type: 'earning' as const },
    { description: 'Performance Bonus', amount: 50000, type: 'earning' as const },
    { description: 'Health Insurance', amount: 20000, type: 'deduction' as const },
    { description: 'Income Tax', amount: employee.salary * 0.1, type: 'deduction' as const },
    { description: 'Social Security', amount: 25000, type: 'deduction' as const },
  ];

  const currentMonth = format(new Date(), "MMMM");
  const currentYear = format(new Date(), "yyyy");

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Employee Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader className="text-center">
                <CardTitle>{employee.name}</CardTitle>
                <p className="text-gray-500">{employee.position}</p>
                {getStatusBadge(employee.status)}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-ems-primary" />
                    <span>{employee.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-ems-primary" />
                    <span>{employee.phone}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-ems-primary" />
                    <span>{employee.department}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-ems-primary" />
                    <span>Joined {formatDate(employee.joinDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="info">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Details</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="leaves">Leave Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employee Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-600 mb-2">Basic Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-500">Full Name</label>
                            <div className="font-medium">{employee.name}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <div className="font-medium">{employee.email}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Phone</label>
                            <div className="font-medium">{employee.phone}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-600 mb-2">Employment Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-500">Position</label>
                            <div className="font-medium">{employee.position}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Department</label>
                            <div className="font-medium">{employee.department}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Join Date</label>
                            <div className="font-medium">{formatDate(employee.joinDate)}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Status</label>
                            <div className="font-medium">{getStatusBadge(employee.status)}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Salary</label>
                            <div className="font-medium">{employee.salary.toLocaleString()} FCFA</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={() => navigate(`/employees/edit/${employee.id}`)}
                          className="bg-ems-primary hover:bg-ems-secondary"
                        >
                          Edit Employee
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="performance">
                <PerformanceRating employeeId={employee.id} employeeName={employee.name} />
              </TabsContent>
              
              <TabsContent value="payroll">
                <PayrollSlip
                  employeeName={employee.name}
                  employeeId={employee.id}
                  department={employee.department}
                  position={employee.position}
                  month={currentMonth}
                  year={currentYear}
                  baseSalary={employee.salary}
                  items={mockPayrollItems}
                />
              </TabsContent>
              
              <TabsContent value="leaves">
                <LeaveManagement 
                  employeeId={employee.id}
                  employeeName={employee.name}
                  leaves={employeeLeaves}
                  onLeaveAdd={handleLeaveRequest}
                  onLeaveUpdate={handleLeaveUpdate}
                  isManagerView={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetail;
