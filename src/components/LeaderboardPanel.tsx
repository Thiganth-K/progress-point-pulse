import { useState } from "react";
import { useStudents } from "@/context/StudentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Medal, TrendingUp, BarChart, Loader } from "lucide-react";
import { Student } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const LeaderboardPanel = () => {
  const { students, updateStudentMarks } = useStudents();
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [editValues, setEditValues] = useState<Record<string, {
    presentation: string;
    efforts: string;
    assignment: string;
    assessment: string;
  }>>({});

  // Initialize edit values from students data
  const initializeEditValues = () => {
    const values: Record<string, any> = {};
    students.forEach(student => {
      values[student.id] = {
        presentation: student.marks.presentation.toString(),
        efforts: student.marks.efforts.toString(),
        assignment: student.marks.assignment.toString(),
        assessment: student.marks.assessment.toString(),
      };
    });
    setEditValues(values);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!editMode) {
      initializeEditValues();
    }
    setEditMode(!editMode);
  };

  // Save changes with loading animation
  const saveChanges = async () => {
    setIsUpdating(true);
    try {
      // Simulate a network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      students.forEach(student => {
        const studentEdits = editValues[student.id];
        if (studentEdits) {
          updateStudentMarks(student.id, {
            presentation: Number(studentEdits.presentation),
            efforts: Number(studentEdits.efforts),
            assignment: Number(studentEdits.assignment),
            assessment: Number(studentEdits.assessment),
          });
        }
      });
      
      toast({
        title: "Success",
        description: "Leaderboard has been updated successfully",
      });
    } finally {
      setIsUpdating(false);
      setEditMode(false);
    }
  };

  // Handle input change
  const handleInputChange = (studentId: string, field: keyof typeof editValues[string], value: string) => {
    // Only allow numbers 0-100
    const numValue = value === '' ? '' : Math.max(0, Math.min(100, Number(value)));
    
    setEditValues(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numValue.toString()
      }
    }));
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Leaderboard Panel</h2>
        
        <Button 
          onClick={toggleEditMode}
          variant={editMode ? "outline" : "default"}
          className={editMode ? "border-orange-500 text-orange-500" : ""}
        >
          {editMode ? "Cancel" : "Update Marks"}
        </Button>
      </div>

      {editMode ? (
        <EditMarksView 
          students={students}
          editValues={editValues}
          onChange={handleInputChange}
          onSave={saveChanges}
          isUpdating={isUpdating}
        />
      ) : (
        <LeaderboardView students={students} />
      )}
    </div>
  );
};

interface LeaderboardViewProps {
  students: Student[];
}

const LeaderboardView = ({ students }: LeaderboardViewProps) => {
  // Function to determine medal color
  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-500";
      case 1: return "text-gray-400";
      case 2: return "text-amber-700";
      default: return "text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glassmorphism">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-blue-600" />
              Average Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["presentation", "efforts", "assignment", "assessment"].map(category => {
                const avg = students.reduce((sum, student) => 
                  sum + student.marks[category as keyof typeof student.marks], 0) / students.length;
                
                return (
                  <div key={category} className="grid grid-cols-2 gap-2">
                    <span className="text-sm capitalize">{category}</span>
                    <div className="flex items-center">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full flex-grow">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          style={{ width: `${avg}%` }}
                        ></div>
                      </div>
                      <span className="text-xs ml-2">{avg.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(students.reduce((sum, student) => sum + student.marks.total, 0) / students.length)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Average Total Score</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(students.reduce((sum, student) => sum + student.attendancePercentage, 0) / students.length)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Average Attendance</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Medal className="w-5 h-5 mr-2 text-blue-600" />
            Student Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student, index) => (
              <div 
                key={student.id}
                className={cn(
                  "flex items-center p-4 rounded-lg transition-all",
                  index < 3 ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-md" : 
                  "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                )}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  {index < 3 ? (
                    <Medal className={cn("w-5 h-5", getMedalColor(index))} />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="ml-4 flex-grow">
                  <h3 className="font-medium">{student.name}</h3>
                  <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="mr-3">Attendance: {student.attendancePercentage}%</span>
                    <span>Total Score: {student.marks.total}</span>
                  </div>
                </div>
                
                <div className="hidden sm:flex space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{student.marks.presentation}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pres</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{student.marks.efforts}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Eff</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{student.marks.assignment}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Asgn</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{student.marks.assessment}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Asmnt</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface EditMarksViewProps {
  students: Student[];
  editValues: Record<string, {
    presentation: string;
    efforts: string;
    assignment: string;
    assessment: string;
  }>;
  onChange: (studentId: string, field: string, value: string) => void;
  onSave: () => void;
  isUpdating: boolean;
}

const EditMarksView = ({ students, editValues, onChange, onSave, isUpdating }: EditMarksViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-2 border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
          <CardTitle className="text-lg">Update Student Marks</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <h3 className="font-medium mb-3">{student.name}</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Presentation
                    </label>
                    <Input 
                      type="number"
                      min="0"
                      max="100"
                      value={editValues[student.id]?.presentation || ''}
                      onChange={(e) => onChange(student.id, 'presentation', e.target.value)}
                      className="h-9"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Efforts
                    </label>
                    <Input 
                      type="number"
                      min="0"
                      max="100"
                      value={editValues[student.id]?.efforts || ''}
                      onChange={(e) => onChange(student.id, 'efforts', e.target.value)}
                      className="h-9"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Assignment
                    </label>
                    <Input 
                      type="number"
                      min="0"
                      max="100"
                      value={editValues[student.id]?.assignment || ''}
                      onChange={(e) => onChange(student.id, 'assignment', e.target.value)}
                      className="h-9"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Assessment
                    </label>
                    <Input 
                      type="number"
                      min="0"
                      max="100"
                      value={editValues[student.id]?.assessment || ''}
                      onChange={(e) => onChange(student.id, 'assessment', e.target.value)}
                      className="h-9"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={onSave}
              className="bg-orange-600 hover:bg-orange-700 transition-colors"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating Leaderboard...
                </>
              ) : (
                'Update & Sort Leaderboard'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPanel;
