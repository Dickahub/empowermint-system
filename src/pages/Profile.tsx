
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import { useLeaves } from "@/context/LeaveContext";
import { usePerformance } from "@/context/PerformanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { User, Mail, Phone, Briefcase, Calendar } from "lucide-react";
import LeaveManagement from "@/components/LeaveManagement";
import PayrollSlip from "@/components/PayrollSlip";

const Profile = () => {
  const { user } = useAuth();
  const { getEmployeeByEmail } = useEmployees();
  const { leaves, addLeave } = useLeaves();
  const { getEmployeeRatings, getAverageRating } = usePerformance();

  // Find the employee data based on the logged-in user's email
  const employeeData = user?.email ? getEmployeeByEmail(user.email) : null;

  // Employee-specific data
  const employeeLeaves = employeeData ? leaves.filter(leave => leave.employeeId === employeeData.id) : [];
  const performanceRatings = employeeData ? getEmployeeRatings(employeeData.id) : [];
  const averageRating = employeeData ? getAverageRating(employeeData.id) : 0;

  // Mock payroll items for the employee
  const mockPayrollItems = employeeData ? [
    { description: 'Transport Allowance', amount: 25000, type: 'earning' as const },
    { description: 'Performance Bonus', amount: 30000, type: 'earning' as const },
    { description: 'Health Insurance', amount: 15000, type: 'deduction' as const },
    { description: 'Income Tax', amount: employeeData.salary * 0.1, type: 'deduction' as const },
    { description: 'Social Security', amount: 20000, type: 'deduction' as const },
  ] : [];

  const currentMonth = format(new Date(), "MMMM");
  const currentYear = format(new Date(), "yyyy");

  const handleLeaveRequest = (leaveData: Omit<any, 'id' | 'createdAt'>) => {
    addLeave(leaveData);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Loading profile...</h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader className="text-center">
                <Avatar className="mx-auto h-20 w-20">
                  <AvatarFallback className="bg-ems-primary text-white text-xl">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-2">{user.name}</CardTitle>
                <p className="text-gray-500">{employeeData?.position || 'Employee'}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-ems-primary" />
                    <span>{user.email}</span>
                  </div>
                  
                  {employeeData && (
                    <>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-ems-primary" />
                        <span>{employeeData.phone}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-ems-primary" />
                        <span>{employeeData.department}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-ems-primary" />
                        <span>Joined {format(new Date(employeeData.joinDate), "MMM dd, yyyy")}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Full Name</label>
                        <div className="font-medium">{user.name}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <div className="font-medium">{user.email}</div>
                      </div>
                      
                      {employeeData && (
                        <>
                          <div>
                            <label className="text-sm text-gray-500">Phone</label>
                            <div className="font-medium">{employeeData.phone}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Position</label>
                            <div className="font-medium">{employeeData.position}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Department</label>
                            <div className="font-medium">{employeeData.department}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Salary</label>
                            <div className="font-medium">{employeeData.salary.toLocaleString()} FCFA</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="leaves">
                {employeeData ? (
                  <LeaveManagement
                    employeeId={employeeData.id}
                    employeeName={employeeData.name}
                    leaves={employeeLeaves}
                    onLeaveAdd={handleLeaveRequest}
                    isManagerView={false}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-center text-gray-500">
                        Your employee profile information is not available.
                        Please contact your manager or HR department.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="payroll">
                {employeeData ? (
                  <PayrollSlip
                    employeeName={employeeData.name}
                    employeeId={employeeData.id}
                    department={employeeData.department}
                    position={employeeData.position}
                    month={currentMonth}
                    year={currentYear}
                    baseSalary={employeeData.salary}
                    items={mockPayrollItems}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-center text-gray-500">
                        Your payroll information is not available.
                        Please contact your manager or HR department.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="performance">
                {employeeData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Evaluations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Overall Performance</h3>
                          <div className="flex items-center">
                            <div className="text-2xl font-bold text-ems-primary mr-2">
                              {averageRating.toFixed(1)}
                            </div>
                            <span className="text-sm text-gray-500">/ 5.0</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-ems-primary h-2.5 rounded-full" 
                            style={{ width: `${(averageRating / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {performanceRatings.length > 0 ? (
                        <div className="space-y-6">
                          {performanceRatings.map((rating) => (
                            <div key={rating.id} className="border-t pt-4">
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-500">{rating.period}</span>
                                <div className="flex items-center">
                                  <span className="text-lg font-bold text-ems-primary mr-1">
                                    {rating.rating}
                                  </span>
                                  <span className="text-sm text-gray-500">/ 5</span>
                                </div>
                              </div>
                              <h4 className="font-medium mb-2">Feedback</h4>
                              <p className="text-gray-700 mb-4">{rating.feedback}</p>
                              <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                              <p className="text-gray-700">{rating.improvementSuggestions}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-6">
                          No performance evaluations available yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-center text-gray-500">
                        Your performance information is not available.
                        Please contact your manager or HR department.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
