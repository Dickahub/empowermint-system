
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmployees, getDepartments } from "@/context/EmployeeContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const EmployeeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addEmployee, updateEmployee, getEmployee } = useEmployees();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    joinDate: "",
    status: "active" as "active" | "inactive" | "on_leave",
    salary: 0,
    password: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const departments = getDepartments();

  useEffect(() => {
    if (isEditMode) {
      const employee = getEmployee(id);
      if (employee) {
        setFormData({
          name: employee.name,
          email: employee.email,
          phone: employee.phone || "",
          department: employee.department,
          position: employee.position,
          joinDate: employee.joinDate,
          status: employee.status,
          salary: employee.salary,
          password: "" // We don't store or show passwords
        });
      } else {
        toast.error("Employee not found");
        navigate("/employees");
      }
    }
  }, [id, isEditMode, getEmployee, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? Number(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Make sure password is provided for new employees
      if (!isEditMode && !formData.password) {
        toast.error("Password is required for new employees");
        setIsSubmitting(false);
        return;
      }

      if (isEditMode) {
        // Don't include password in updates unless it's changed
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateEmployee(id, updateData);
        toast.success("Employee updated successfully!");
      } else {
        await addEmployee(formData);
        toast.success("Employee added successfully!");
      }
      navigate("/employees");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was a problem saving the employee information.");
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Employee" : "Add New Employee"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Employee Details" : "Employee Information"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+237 XXX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    name="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive" | "on_leave") => 
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (FCFA)</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Password field - only required for new employees */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {isEditMode ? "Password (leave blank to keep current)" : "Password"}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditMode}
                    placeholder={isEditMode ? "••••••••" : ""}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/employees")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-ems-primary hover:bg-ems-secondary"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Employee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeForm;
