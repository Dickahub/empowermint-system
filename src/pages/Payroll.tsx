
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, FileText, Download, Printer } from 'lucide-react';
import PayrollSlip from '@/components/PayrollSlip';

// Mock payroll data updated for 2025
const payrollData = [
  {
    id: '1',
    employeeId: '3',
    employeeName: 'Employee User',
    department: 'Financial Department',
    position: 'Accountant',
    month: 'January',
    year: '2025',
    baseSalary: 800000,
    totalEarnings: 825000,
    totalDeductions: 85000,
    netSalary: 740000,
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Manager User',
    department: 'Marketing Department',
    position: 'Marketing Manager',
    month: 'January',
    year: '2025',
    baseSalary: 1200000,
    totalEarnings: 1250000,
    totalDeductions: 125000,
    netSalary: 1125000,
  }
];

// Mock payroll items data
const payrollItemsData = {
  '1': [
    { description: 'Performance Bonus', amount: 25000, type: 'earning' as const },
    { description: 'Income Tax', amount: 50000, type: 'deduction' as const },
    { description: 'Health Insurance', amount: 15000, type: 'deduction' as const },
    { description: 'Pension Contribution', amount: 20000, type: 'deduction' as const },
  ],
  '2': [
    { description: 'Performance Bonus', amount: 50000, type: 'earning' as const },
    { description: 'Income Tax', amount: 75000, type: 'deduction' as const },
    { description: 'Health Insurance', amount: 25000, type: 'deduction' as const },
    { description: 'Pension Contribution', amount: 25000, type: 'deduction' as const },
  ]
};

const Payroll: React.FC = () => {
  const { user, isManager, isAdmin } = useAuth();
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState('2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState<string | null>(null);

  // If not a manager or admin, redirect or show access denied
  if (!isManager && !isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter payroll data based on search term
  const filteredPayroll = payrollData.filter(p => 
    p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected payroll details
  const selectedPayrollData = payrollData.find(p => p.id === selectedPayroll);
  const selectedPayrollItems = selectedPayroll ? payrollItemsData[selectedPayroll as keyof typeof payrollItemsData] : [];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Payroll Management</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Payroll Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="md:w-1/4">
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-1/4">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {['2023', '2024', '2025', '2026'].map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-1/2">
                <Input 
                  placeholder="Search by name, department, or position" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Net Salary (FCFA)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No payroll records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayroll.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">{payroll.employeeName}</TableCell>
                      <TableCell>{payroll.department}</TableCell>
                      <TableCell>{payroll.position}</TableCell>
                      <TableCell className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {payroll.month} {payroll.year}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {payroll.netSalary.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedPayroll(payroll.id)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Slip
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Payroll Slip</DialogTitle>
                            </DialogHeader>
                            {selectedPayrollData && (
                              <PayrollSlip
                                employeeName={selectedPayrollData.employeeName}
                                employeeId={selectedPayrollData.employeeId}
                                department={selectedPayrollData.department}
                                position={selectedPayrollData.position}
                                month={selectedPayrollData.month}
                                year={selectedPayrollData.year}
                                baseSalary={selectedPayrollData.baseSalary}
                                items={selectedPayrollItems}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Payroll;
