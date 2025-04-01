
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePerformance } from '@/context/PerformanceContext';
import { useEmployees } from '@/context/EmployeeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PerformanceAnalytics: React.FC = () => {
  const { ratings, getRatingsByPeriod, getPeriods, getDepartmentAverages } = usePerformance();
  const { employees } = useEmployees();
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>('all');
  
  const periods = getPeriods();
  const departmentAverages = getDepartmentAverages();
  
  const filteredRatings = selectedPeriod === 'all' 
    ? ratings 
    : getRatingsByPeriod(selectedPeriod);
  
  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = [0, 0, 0, 0, 0]; // For ratings 1-5
    
    filteredRatings.forEach(rating => {
      distribution[rating.rating - 1]++;
    });
    
    return [
      { name: '1 Star', value: distribution[0] },
      { name: '2 Stars', value: distribution[1] },
      { name: '3 Stars', value: distribution[2] },
      { name: '4 Stars', value: distribution[3] },
      { name: '5 Stars', value: distribution[4] },
    ];
  }, [filteredRatings]);
  
  // Calculate employee performance data
  const employeePerformance = useMemo(() => {
    const performanceData: { name: string; rating: number }[] = [];
    
    employees.forEach(employee => {
      const employeeRatings = filteredRatings.filter(r => r.employeeId === employee.id);
      if (employeeRatings.length === 0) return;
      
      const totalRating = employeeRatings.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = parseFloat((totalRating / employeeRatings.length).toFixed(1));
      
      performanceData.push({
        name: employee.name,
        rating: avgRating,
      });
    });
    
    return performanceData.sort((a, b) => b.rating - a.rating);
  }, [employees, filteredRatings]);
  
  const periodTrends = useMemo(() => {
    if (periods.length <= 1) return [];
    
    return periods.map(period => {
      const periodRatings = getRatingsByPeriod(period);
      const totalRating = periodRatings.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = periodRatings.length > 0 
        ? parseFloat((totalRating / periodRatings.length).toFixed(1)) 
        : 0;
      
      return {
        name: period,
        avgRating,
        count: periodRatings.length,
      };
    });
  }, [periods, getRatingsByPeriod]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periods.map(period => (
              <SelectItem key={period} value={period}>{period}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Distribution of performance ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Department Averages</CardTitle>
            <CardDescription>
              Average performance rating by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentAverages}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={false} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}/5`, 'Rating']}
                    labelFormatter={(label) => 
                      departmentAverages.find(d => d.department === label)?.department || ''
                    }
                  />
                  <Legend />
                  <Bar dataKey="average" name="Average Rating" fill="#4299e1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {periodTrends.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Average rating trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={periodTrends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" domain={[0, 5]} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="avgRating" 
                      name="Average Rating" 
                      stroke="#4299e1" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="count" 
                      name="Number of Ratings" 
                      stroke="#48bb78" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
        
        {employeePerformance.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Employee Performance Comparison</CardTitle>
              <CardDescription>
                Average ratings for each employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeePerformance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value) => [`${value}/5`, 'Rating']} />
                    <Legend />
                    <Bar dataKey="rating" name="Average Rating" fill="#4299e1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
