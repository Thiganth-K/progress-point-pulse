
export interface Student {
  id: string;
  name: string;
  attendance: AttendanceRecord[];
  marks: {
    presentation: number;
    efforts: number;
    assignment: number;
    assessment: number;
    total: number;
  };
  attendancePercentage: number;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent';
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  displayName: string;
}

export interface AuthContextType {
  user: Admin | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}
