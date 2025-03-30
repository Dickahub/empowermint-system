
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, Phone, Mail, Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEmployee, deleteEmployee } = useEmployees();
  const { isAdmin } = useAuth();
  const [employee, setEmployee] = useState(getEmployee(id || ""));

  useEffect(() => {
    if (!id) {
      navigate("/employees");
      return;
    }

    const employeeData = getEmployee(id);
    if (!employeeData) {
      toast.error("Employee not found");
      navigate("/employees");
      return;
    }

    setEmployee(employeeData);
  }, [id, getEmployee, navigate]);

  if (!employee) {
    return null;
  }

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

  const handleDeleteEmployee = () => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(employee.id);
      toast.success(`${employee.name} has been removed`);
      navigate("/employees");
    }
  };

  const formatSalary = (salary: number) => {
    return `${salary.toLocaleString()} FCFA`;
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Employee Details</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Card className="w-full md:w-2/3">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{employee.name}</CardTitle>
                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/employees/edit/${employee.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-ems-danger hover:bg-red-50"
                        onClick={handleDeleteEmployee}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Position</h3>
                  <p className="mt-1 text-base font-medium">{employee.position}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1 text-base font-medium">{employee.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">{getStatusBadge(employee.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
                  <p className="mt-1 text-base font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {new Date(employee.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-base font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {employee.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1 text-base font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    {employee.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Salary</h3>
                  <p className="mt-1 text-base font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                    {formatSalary(employee.salary)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full md:w-1/3">
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
                <p className="mt-1 text-sm">{employee.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employment Status</h3>
                <p className="mt-1 text-sm">{employee.status === 'active' ? 'Full-time' : employee.status === 'inactive' ? 'Terminated' : 'On Leave'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employment Duration</h3>
                <p className="mt-1 text-sm">
                  {(() => {
                    const startDate = new Date(employee.joinDate);
                    const today = new Date();
                    const years = today.getFullYear() - startDate.getFullYear();
                    const months = today.getMonth() - startDate.getMonth();
                    const totalMonths = years * 12 + months;
                    
                    if (totalMonths < 0) return "Not started yet";
                    if (totalMonths === 0) return "Less than a month";
                    if (totalMonths < 12) return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
                    return `${Math.floor(totalMonths / 12)} year${Math.floor(totalMonths / 12) > 1 ? 's' : ''} ${totalMonths % 12 > 0 ? `and ${totalMonths % 12} month${totalMonths % 12 > 1 ? 's' : ''}` : ''}`;
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetail;
