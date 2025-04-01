
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import { usePerformance } from "@/context/PerformanceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Building2, Award, Calendar, Star } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { employees, getEmployeeByEmail } = useEmployees();
  const { getEmployeeRatings, getLatestEmployeeRating, getAverageRating } = usePerformance();
  
  const employee = user ? getEmployeeByEmail(user.email) : null;
  
  const employeeRatings = employee ? getEmployeeRatings(employee.id) : [];
  const latestRating = employee ? getLatestEmployeeRating(employee.id) : undefined;
  const averageRating = employee ? getAverageRating(employee.id) : 0;
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          <Card>
            <CardContent className="pt-6">
              <p>You need to be logged in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
              </div>
              <CardTitle className="text-center">{user.name}</CardTitle>
              <CardDescription className="text-center">{user.position}</CardDescription>
              <div className="flex justify-center mt-2">
                <Badge className={
                  user.role === 'admin' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : user.role === 'manager' 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'bg-green-500 hover:bg-green-600'
                }>
                  {user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Manager' : 'Employee'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex">
                  <Mail className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                {employee && (
                  <>
                    <div className="flex">
                      <Phone className="h-5 w-5 mr-3 text-gray-500" />
                      <span>{employee.phone}</span>
                    </div>
                    <div className="flex">
                      <Building2 className="h-5 w-5 mr-3 text-gray-500" />
                      <span>{user.department}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-6">
                <Button className="w-full">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">Full Name</label>
                            <div className="font-medium">{user.name}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <div className="font-medium">{user.email}</div>
                          </div>
                          {employee && (
                            <>
                              <div>
                                <label className="text-sm text-gray-500">Phone</label>
                                <div className="font-medium">{employee.phone}</div>
                              </div>
                              <div>
                                <label className="text-sm text-gray-500">Department</label>
                                <div className="font-medium">{user.department}</div>
                              </div>
                              <div>
                                <label className="text-sm text-gray-500">Position</label>
                                <div className="font-medium">{user.position}</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {latestRating && (
                        <div>
                          <h3 className="font-medium mb-2">Latest Performance Review</h3>
                          <div className="p-4 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-500">{latestRating.period}</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    className={
                                      index < latestRating.rating
                                        ? "w-4 h-4 fill-yellow-400 text-yellow-400"
                                        : "w-4 h-4 text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="mb-2">
                              <label className="text-sm text-gray-500">Feedback</label>
                              <p>{latestRating.feedback}</p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Improvement Areas</label>
                              <p>{latestRating.improvementSuggestions}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Feedback</CardTitle>
                    <CardDescription>
                      Your performance evaluations and feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {employeeRatings.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <Award className="h-5 w-5 mr-2 text-blue-500" />
                            <span>Average Rating:</span>
                          </div>
                          <div className="flex items-center">
                            <div className="font-medium mr-2">{averageRating.toFixed(1)}/5</div>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={
                                    index < Math.round(averageRating)
                                      ? "w-4 h-4 fill-yellow-400 text-yellow-400"
                                      : "w-4 h-4 text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {employeeRatings
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((rating) => (
                              <div key={rating.id} className="border rounded-md p-4">
                                <div className="flex justify-between items-center mb-3">
                                  <h3 className="font-medium">{rating.period}</h3>
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                      <Star
                                        key={index}
                                        className={
                                          index < rating.rating
                                            ? "w-4 h-4 fill-yellow-400 text-yellow-400"
                                            : "w-4 h-4 text-gray-300"
                                        }
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-sm font-medium">Feedback</h4>
                                    <p className="text-gray-700">{rating.feedback}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Areas for Improvement</h4>
                                    <p className="text-gray-700">{rating.improvementSuggestions}</p>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Evaluation date: {new Date(rating.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium mb-1">No Performance Data</h3>
                        <p className="text-gray-500">
                          You haven't received any performance evaluations yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
