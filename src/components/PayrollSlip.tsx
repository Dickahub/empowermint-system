
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface PayrollItem {
  description: string;
  amount: number;
  type: 'earning' | 'deduction';
}

interface PayrollSlipProps {
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  month: string;
  year: string;
  baseSalary: number;
  items: PayrollItem[];
}

const PayrollSlip: React.FC<PayrollSlipProps> = ({
  employeeName,
  employeeId,
  department,
  position,
  month,
  year,
  baseSalary,
  items
}) => {
  const totalEarnings = items
    .filter(item => item.type === 'earning')
    .reduce((sum, item) => sum + item.amount, baseSalary);
    
  const totalDeductions = items
    .filter(item => item.type === 'deduction')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const netSalary = totalEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  // In a real app, this would generate and download a PDF
  const handleDownload = () => {
    alert("This would download the payroll slip as a PDF in a real application.");
  };

  return (
    <Card className="print:shadow-none">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center print:hidden">
          <CardTitle className="text-xl">Payroll Slip</CardTitle>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        <div className="print:text-center print:mt-0 mt-4">
          <h2 className="text-2xl font-bold print:text-3xl">SECEL Sarl</h2>
          <p className="text-muted-foreground">Payroll Slip for {month} {year}</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Employee Details</h3>
            <div className="space-y-1">
              <p><span className="text-muted-foreground">Name:</span> {employeeName}</p>
              <p><span className="text-muted-foreground">ID:</span> {employeeId}</p>
              <p><span className="text-muted-foreground">Position:</span> {position}</p>
              <p><span className="text-muted-foreground">Department:</span> {department}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="space-y-1">
              <p><span className="text-muted-foreground">Payment Period:</span> {month} {year}</p>
              <p><span className="text-muted-foreground">Payment Date:</span> 28th {month} {year}</p>
              <p><span className="text-muted-foreground">Payment Method:</span> Bank Transfer</p>
            </div>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount (FCFA)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Base Salary</TableCell>
              <TableCell className="text-right">{baseSalary.toLocaleString()}</TableCell>
            </TableRow>
            
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell className={`text-right ${item.type === 'deduction' ? 'text-red-500' : ''}`}>
                  {item.type === 'deduction' ? '-' : ''}{item.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            
            <TableRow className="border-t-2">
              <TableCell className="font-semibold">Total Earnings</TableCell>
              <TableCell className="text-right font-semibold">{totalEarnings.toLocaleString()}</TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-semibold">Total Deductions</TableCell>
              <TableCell className="text-right font-semibold text-red-500">-{totalDeductions.toLocaleString()}</TableCell>
            </TableRow>
            
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold text-lg">Net Salary</TableCell>
              <TableCell className="text-right font-bold text-lg">{netSalary.toLocaleString()} FCFA</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This is a computer-generated document. No signature is required.</p>
          <p>SECEL Sarl - Excellence in Service</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayrollSlip;
