
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, StarHalf } from 'lucide-react';
import { usePerformance, PerformanceRating as PerformanceRatingType } from '@/context/PerformanceContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface PerformanceRatingProps {
  employeeId: string;
  employeeName: string;
}

const PerformanceRating: React.FC<PerformanceRatingProps> = ({ employeeId, employeeName }) => {
  const { isManager, user } = useAuth();
  const { 
    addRating, 
    getEmployeeRatings, 
    getAverageRating,
    getLatestEmployeeRating 
  } = usePerformance();
  
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [period, setPeriod] = useState(`Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`);
  
  const employeeRatings = getEmployeeRatings(employeeId);
  const averageRating = getAverageRating(employeeId);
  const latestRating = getLatestEmployeeRating(employeeId);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addRating({
      employeeId,
      rating,
      feedback,
      improvementSuggestions: suggestions,
      period,
    });
    
    setIsEditing(false);
    setRating(3);
    setFeedback('');
    setSuggestions('');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Performance Evaluation</span>
          {isManager && !isEditing && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Add Rating
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {employeeRatings.length > 0 
            ? `${employeeName}'s average rating: ${averageRating}/5` 
            : 'No performance ratings yet'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="period">Evaluation Period</Label>
              <input
                id="period"
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="mr-1"
                  >
                    <Star 
                      className={value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                      size={24} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="feedback">Performance Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide feedback on the employee's performance..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="suggestions">Improvement Suggestions</Label>
              <Textarea
                id="suggestions"
                placeholder="Suggest areas for improvement..."
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Evaluation</Button>
            </div>
          </form>
        ) : (
          <div>
            {latestRating ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Latest Evaluation ({latestRating.period})</h3>
                  <div className="flex mt-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star 
                        key={index}
                        className={
                          index < latestRating.rating 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        } 
                        size={20} 
                      />
                    ))}
                    <span className="ml-2 font-medium">{latestRating.rating}/5</span>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium">Feedback:</h4>
                    <p className="text-gray-700">{latestRating.feedback}</p>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium">Improvement Suggestions:</h4>
                    <p className="text-gray-700">{latestRating.improvementSuggestions}</p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Evaluated on {format(new Date(latestRating.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
                
                {employeeRatings.length > 1 && (
                  <div>
                    <h3 className="font-medium">Performance History</h3>
                    <div className="space-y-2 mt-2">
                      {employeeRatings
                        .filter(r => r.id !== latestRating.id)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3)
                        .map(rating => (
                          <div key={rating.id} className="border-t pt-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{rating.period}</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star 
                                    key={index}
                                    className={
                                      index < rating.rating 
                                        ? "fill-yellow-400 text-yellow-400" 
                                        : "text-gray-300"
                                    } 
                                    size={16} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isManager 
                  ? "Click 'Add Rating' to provide performance feedback for this employee."
                  : "No performance ratings have been provided yet."}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceRating;
