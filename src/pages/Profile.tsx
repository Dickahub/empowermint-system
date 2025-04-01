
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEmployees } from '@/context/EmployeeContext';
import { useLeaves } from '@/context/LeaveContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Mail, User, Phone, Briefcase, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LeaveManagement from '@/components/LeaveManagement';
import PayrollSlip from '@/components/PayrollSlip';

const Profile = () => {
  const { user } = useAuth();
  const { getEmployeeByEmail } = useEmployees();
  const { leaves, addLeave } = useLeaves();
  
  const employee = user?.email ? getEmployeeByEmail(user.email) : null;

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <p>You need to be logged in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <p>Employee record not found. Please contact your administrator.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM dd, yyyy');
  };

  // Filter leaves for this employee
  const employeeLeaves = leaves.filter(leave => leave.employeeId === employee.id);

  // Function to handle leave requests
  const handleLeaveRequest = (leaveData: Omit<any, 'id' | 'createdAt'>) => {
    addLeave(leaveData);
  };

  // Mock payroll items for demonstration
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
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-ems-primary text-white text-2xl">
                      {employee.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{employee.name}</CardTitle>
                <p className="text-gray-500">{employee.position}</p>
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
                <TabsTrigger value="info">Personal Info</TabsTrigger>
                <TabsTrigger value="leaves">My Leave Requests</TabsTrigger>
                <TabsTrigger value="payroll">My Payroll</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-600 mb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <label className="text-sm text-gray-500">Salary</label>
                            <div className="font-medium">{employee.salary.toLocaleString()} FCFA</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaves">
                <LeaveManagement 
                  employeeId={employee.id}
                  employeeName={employee.name}
                  leaves={employeeLeaves}
                  onLeaveAdd={handleLeaveRequest}
                  isManagerView={false}
                />
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
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
