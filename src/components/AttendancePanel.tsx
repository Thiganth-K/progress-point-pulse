
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckIcon, XIcon, Eye, CheckCircle, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useStudents } from "@/context/StudentContext";
import { cn } from "@/lib/utils";
import { Student } from "@/types";

const AttendancePanel = () => {
  const { students, updateAttendance, getAttendanceRecords } = useStudents();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent'>>({});
  const [view, setView] = useState<'mark' | 'view'>('mark');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get past attendance records
  const attendanceRecords = getAttendanceRecords();
  const sortedDates = Object.keys(attendanceRecords).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setView('mark');
      
      // Check if we have attendance for this date and pre-fill
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const existingRecord = attendanceRecords[dateString];
      
      if (existingRecord) {
        const preFilledAttendance: Record<string, 'present' | 'absent'> = {};
        existingRecord.records.forEach(record => {
          preFilledAttendance[record.id] = record.status;
        });
        setAttendanceData(preFilledAttendance);
      } else {
        // Default all to present
        const defaultAttendance: Record<string, 'present' | 'absent'> = {};
        students.forEach(student => {
          defaultAttendance[student.id] = 'present';
        });
        setAttendanceData(defaultAttendance);
      }
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      const attendanceArray = Object.entries(attendanceData).map(([id, status]) => ({ id, status }));
      updateAttendance(dateString, attendanceArray);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Attendance Panel</h2>
        
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <div className="flex gap-2">
            <Button 
              variant={view === 'mark' ? 'default' : 'outline'}
              onClick={() => setView('mark')}
              size="sm"
            >
              Mark
            </Button>
            <Button 
              variant={view === 'view' ? 'default' : 'outline'}
              onClick={() => setView('view')}
              size="sm"
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          </div>
        </div>
      </div>

      {view === 'mark' && (
        <>
          {showConfirmation ? (
            <ConfirmationView 
              date={date!}
              students={students}
              attendanceData={attendanceData}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ) : (
            <MarkAttendanceView 
              students={students} 
              attendanceData={attendanceData} 
              onToggle={toggleAttendance}
              onSubmit={handleSubmit}
            />
          )}
        </>
      )}

      {view === 'view' && (
        <ViewAttendanceRecords records={attendanceRecords} sortedDates={sortedDates} />
      )}
    </div>
  );
};

interface MarkAttendanceViewProps {
  students: Student[];
  attendanceData: Record<string, 'present' | 'absent'>;
  onToggle: (studentId: string) => void;
  onSubmit: () => void;
}

const MarkAttendanceView = ({ students, attendanceData, onToggle, onSubmit }: MarkAttendanceViewProps) => {
  return (
    <>
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map(student => (
              <div 
                key={student.id} 
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <span className="font-medium">{student.name}</span>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    attendanceData[student.id] === 'present' 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  )}>
                    {attendanceData[student.id] === 'present' ? 'Present' : 'Absent'}
                  </span>
                  <Switch 
                    checked={attendanceData[student.id] === 'present'}
                    onCheckedChange={() => onToggle(student.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-6">
        <Button
          onClick={onSubmit}
          className="bg-primary-600 hover:bg-primary-700 transition-colors"
        >
          Preview Submission
        </Button>
      </div>
    </>
  );
};

interface ConfirmationViewProps {
  date: Date;
  students: Student[];
  attendanceData: Record<string, 'present' | 'absent'>;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationView = ({ date, students, attendanceData, onConfirm, onCancel }: ConfirmationViewProps) => {
  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 glassmorphism animate-scale-in">
      <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
        <CardTitle className="flex items-center">
          <span>Confirm Attendance - {format(date, 'PPP')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map(student => (
              <div 
                key={student.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg",
                  attendanceData[student.id] === 'present' 
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900" 
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900"
                )}
              >
                {attendanceData[student.id] === 'present' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>{student.name}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Go Back
            </Button>
            <Button onClick={onConfirm} className="bg-primary-600 hover:bg-primary-700">
              Confirm & Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ViewAttendanceRecordsProps {
  records: Record<string, { 
    date: string, 
    records: { id: string, name: string, status: 'present' | 'absent' }[] 
  }>;
  sortedDates: string[];
}

const ViewAttendanceRecords = ({ records, sortedDates }: ViewAttendanceRecordsProps) => {
  return (
    <div className="space-y-6">
      {sortedDates.length === 0 ? (
        <Card className="glassmorphism">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              No attendance records found. Start marking attendance to see records here.
            </p>
          </CardContent>
        </Card>
      ) : (
        sortedDates.map(dateKey => {
          const record = records[dateKey];
          const presentCount = record.records.filter(r => r.status === 'present').length;
          const totalStudents = record.records.length;
          const attendancePercentage = Math.round((presentCount / totalStudents) * 100);
          
          return (
            <Card key={dateKey} className="glassmorphism overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between">
                  <CardTitle>{format(new Date(dateKey), 'PPP')}</CardTitle>
                  <div className="text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {presentCount}/{totalStudents} Present ({attendancePercentage}%)
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {record.records.map(student => (
                    <div 
                      key={student.id}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded text-sm",
                        student.status === 'present' 
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" 
                          : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      )}
                    >
                      {student.status === 'present' ? (
                        <CheckIcon className="h-3 w-3" />
                      ) : (
                        <XIcon className="h-3 w-3" />
                      )}
                      <span className="truncate">{student.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default AttendancePanel;
