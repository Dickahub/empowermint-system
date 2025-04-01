
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployees } from "@/context/EmployeeContext";
import { usePerformance } from "@/context/PerformanceContext";
import PerformanceAnalytics from "@/components/PerformanceAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, BarChart } from "lucide-react";

const Performance = () => {
  const { employees } = useEmployees();
  const { ratings, getAverageRating } = usePerformance();
  
  // Get employees with their average ratings
  const employeesWithRatings = employees.map(employee => ({
    ...employee,
    averageRating: getAverageRating(employee.id)
  }));
  
  // Top performers (average rating > 4)
  const topPerformers = employeesWithRatings
    .filter(emp => emp.averageRating >= 4)
    .sort((a, b) => b.averageRating - a.averageRating);
  
  // Employees needing improvement (average rating < 3)
  const needsImprovement = employeesWithRatings
    .filter(emp => emp.averageRating > 0 && emp.averageRating < 3)
    .sort((a, b) => a.averageRating - b.averageRating);
  
  // Employees without ratings
  const withoutRatings = employeesWithRatings.filter(emp => emp.averageRating === 0);
  
  // Some basic stats
  const totalRatings = ratings.length;
  const employeesRated = employeesWithRatings.filter(emp => emp.averageRating > 0).length;
  const averageOverallRating = employeesWithRatings
    .filter(emp => emp.averageRating > 0)
    .reduce((sum, emp) => sum + emp.averageRating, 0) / (employeesRated || 1);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Performance Management</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees Rated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <User className="h-5 w-5 text-ems-primary mr-2" />
                <div className="text-2xl font-bold">
                  {employeesRated}/{employees.length}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((employeesRated / employees.length) * 100).toFixed(0)}% of employees have received ratings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-ems-primary mr-2" />
                <div className="text-2xl font-bold">
                  {totalRatings}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(totalRatings / (employeesRated || 1)).toFixed(1)} evaluations per rated employee
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-ems-primary mr-2" />
                <div className="text-2xl font-bold">
                  {averageOverallRating.toFixed(1)}/5
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Overall average performance rating
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="analytics">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="topPerformers">Top Performers</TabsTrigger>
            <TabsTrigger value="needsImprovement">Needs Improvement</TabsTrigger>
            <TabsTrigger value="pendingEvaluation">Pending Evaluation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics">
            <PerformanceAnalytics />
          </TabsContent>
          
          <TabsContent value="topPerformers">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Employees with an average rating of 4 or higher
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topPerformers.length > 0 ? (
                  <div className="divide-y">
                    {topPerformers.map((employee) => (
                      <div key={employee.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-green-500 hover:bg-green-600 mr-2">
                            {employee.averageRating.toFixed(1)}/5
                          </Badge>
                          <span className="text-sm">{employee.department}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    No top performers identified yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="needsImprovement">
            <Card>
              <CardHeader>
                <CardTitle>Needs Improvement</CardTitle>
                <CardDescription>
                  Employees with an average rating below 3
                </CardDescription>
              </CardHeader>
              <CardContent>
                {needsImprovement.length > 0 ? (
                  <div className="divide-y">
                    {needsImprovement.map((employee) => (
                      <div key={employee.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-red-500 hover:bg-red-600 mr-2">
                            {employee.averageRating.toFixed(1)}/5
                          </Badge>
                          <span className="text-sm">{employee.department}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    No employees currently need improvement.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pendingEvaluation">
            <Card>
              <CardHeader>
                <CardTitle>Pending Evaluation</CardTitle>
                <CardDescription>
                  Employees who have not yet received a performance evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {withoutRatings.length > 0 ? (
                  <div className="divide-y">
                    {withoutRatings.map((employee) => (
                      <div key={employee.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            Not Rated
                          </Badge>
                          <span className="text-sm">{employee.department}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    All employees have received evaluations.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
