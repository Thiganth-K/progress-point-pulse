
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Student, AttendanceRecord } from '../types';
import { dhanushStudents, meiStudents } from '../data/students';
import { useAuth } from './AuthContext';

interface StudentContextType {
  students: Student[];
  updateAttendance: (date: string, attendanceData: { id: string, status: 'present' | 'absent' }[]) => void;
  updateStudentMarks: (id: string, marks: { presentation?: number, efforts?: number, assignment?: number, assessment?: number }) => void;
  getAttendanceRecords: () => Record<string, { date: string, records: { id: string, name: string, status: 'present' | 'absent' }[] }>;
}

const StudentContext = createContext<StudentContextType | null>(null);

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  
  // Initialize student data based on logged-in admin
  useEffect(() => {
    if (user) {
      const initialStudents = user.username.toLowerCase() === 'dhanush' 
        ? JSON.parse(JSON.stringify(dhanushStudents)) 
        : JSON.parse(JSON.stringify(meiStudents));
      
      // Load any saved data from localStorage
      const savedStudentsKey = `progresspoint_${user.username.toLowerCase()}_students`;
      const savedStudents = localStorage.getItem(savedStudentsKey);
      
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        setStudents(initialStudents);
      }
    } else {
      setStudents([]);
    }
  }, [user]);

  // Save students data to localStorage whenever it changes
  useEffect(() => {
    if (user && students.length > 0) {
      const key = `progresspoint_${user.username.toLowerCase()}_students`;
      localStorage.setItem(key, JSON.stringify(students));
    }
  }, [students, user]);

  const updateAttendance = (date: string, attendanceData: { id: string, status: 'present' | 'absent' }[]) => {
    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        const studentAttendance = attendanceData.find(a => a.id === student.id);
        if (studentAttendance) {
          // Check if there's already an attendance record for this date
          const existingRecordIndex = student.attendance.findIndex(a => a.date === date);
          let newAttendance: AttendanceRecord[];
          
          if (existingRecordIndex >= 0) {
            // Update existing record
            newAttendance = [...student.attendance];
            newAttendance[existingRecordIndex] = { date, status: studentAttendance.status };
          } else {
            // Add new record
            newAttendance = [...student.attendance, { date, status: studentAttendance.status }];
          }
          
          // Calculate new attendance percentage
          const totalRecords = newAttendance.length;
          const presentCount = newAttendance.filter(a => a.status === 'present').length;
          const attendancePercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
          
          return {
            ...student,
            attendance: newAttendance,
            attendancePercentage
          };
        }
        return student;
      });
      
      return updatedStudents;
    });
  };

  const updateStudentMarks = (id: string, marks: { presentation?: number, efforts?: number, assignment?: number, assessment?: number }) => {
    setStudents(prevStudents => {
      return prevStudents.map(student => {
        if (student.id === id) {
          const updatedMarks = {
            presentation: marks.presentation !== undefined ? marks.presentation : student.marks.presentation,
            efforts: marks.efforts !== undefined ? marks.efforts : student.marks.efforts,
            assignment: marks.assignment !== undefined ? marks.assignment : student.marks.assignment,
            assessment: marks.assessment !== undefined ? marks.assessment : student.marks.assessment,
            total: 0 // Will calculate below
          };
          
          // Calculate new total
          updatedMarks.total = updatedMarks.presentation + updatedMarks.efforts + 
                              updatedMarks.assignment + updatedMarks.assessment;
          
          return {
            ...student,
            marks: updatedMarks
          };
        }
        return student;
      }).sort((a, b) => {
        // Sort by total marks first
        if (b.marks.total !== a.marks.total) {
          return b.marks.total - a.marks.total;
        }
        // If total marks are the same, sort by attendance percentage
        return b.attendancePercentage - a.attendancePercentage;
      });
    });
  };

  const getAttendanceRecords = () => {
    const records: Record<string, { 
      date: string, 
      records: { id: string, name: string, status: 'present' | 'absent' }[] 
    }> = {};

    // Group attendance records by date
    students.forEach(student => {
      student.attendance.forEach(att => {
        if (!records[att.date]) {
          records[att.date] = { date: att.date, records: [] };
        }
        
        records[att.date].records.push({
          id: student.id,
          name: student.name,
          status: att.status
        });
      });
    });

    return records;
  };

  return (
    <StudentContext.Provider value={{ 
      students, 
      updateAttendance, 
      updateStudentMarks,
      getAttendanceRecords
    }}>
      {children}
    </StudentContext.Provider>
  );
};
