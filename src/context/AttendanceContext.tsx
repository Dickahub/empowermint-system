
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from './AuthContext';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
}

interface AttendanceContextProps {
  attendanceRecords: AttendanceRecord[];
  clockIn: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
  getEmployeeAttendance: (employeeId: string) => AttendanceRecord[];
  getTodayAttendance: (employeeId: string) => AttendanceRecord | undefined;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void;
  loading: boolean;
}

const AttendanceContext = createContext<AttendanceContextProps | undefined>(undefined);

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to get current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Mock attendance data
const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '1',
    date: '2023-08-21',
    clockIn: '09:05',
    clockOut: '17:30',
    status: 'present',
  },
  {
    id: '2',
    employeeId: '2',
    date: '2023-08-21',
    clockIn: '08:55',
    clockOut: '17:15',
    status: 'present',
  },
  {
    id: '3',
    employeeId: '3',
    date: '2023-08-21',
    clockIn: '09:20',
    clockOut: '17:45',
    status: 'late',
    notes: 'Traffic delay',
  },
  {
    id: '4',
    employeeId: '4',
    date: '2023-08-21',
    clockIn: null,
    clockOut: null,
    status: 'absent',
    notes: 'Sick leave',
  },
  {
    id: '5',
    employeeId: '5',
    date: '2023-08-21',
    clockIn: '09:00',
    clockOut: '13:30',
    status: 'half_day',
    notes: 'Doctor appointment',
  },
];

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    const fetchAttendance = () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const storedAttendance = localStorage.getItem('ems-attendance');
        
        if (storedAttendance) {
          setAttendanceRecords(JSON.parse(storedAttendance));
        } else {
          // Use mock data for initial setup
          setAttendanceRecords(mockAttendanceRecords);
          localStorage.setItem('ems-attendance', JSON.stringify(mockAttendanceRecords));
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Save to localStorage whenever records change
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      localStorage.setItem('ems-attendance', JSON.stringify(attendanceRecords));
    }
  }, [attendanceRecords]);

  const clockIn = (employeeId: string) => {
    const today = getTodayDate();
    const existingRecord = attendanceRecords.find(
      record => record.employeeId === employeeId && record.date === today
    );

    if (existingRecord && existingRecord.clockIn) {
      toast.error('You have already clocked in today');
      return;
    }

    const currentTime = getCurrentTime();
    
    if (existingRecord) {
      // Update existing record
      setAttendanceRecords(prev =>
        prev.map(record =>
          record.id === existingRecord.id
            ? { ...record, clockIn: currentTime, status: 'present' }
            : record
        )
      );
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId,
        date: today,
        clockIn: currentTime,
        clockOut: null,
        status: 'present',
      };
      
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
    
    toast.success(`Clocked in at ${currentTime}`);
  };

  const clockOut = (employeeId: string) => {
    const today = getTodayDate();
    const existingRecord = attendanceRecords.find(
      record => record.employeeId === employeeId && record.date === today
    );

    if (!existingRecord) {
      toast.error('No clock-in record found for today');
      return;
    }

    if (existingRecord.clockOut) {
      toast.error('You have already clocked out today');
      return;
    }

    if (!existingRecord.clockIn) {
      toast.error('You need to clock in before clocking out');
      return;
    }

    const currentTime = getCurrentTime();
    
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.id === existingRecord.id
          ? { ...record, clockOut: currentTime }
          : record
      )
    );
    
    toast.success(`Clocked out at ${currentTime}`);
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return attendanceRecords.filter(record => record.employeeId === employeeId);
  };

  const getTodayAttendance = (employeeId: string) => {
    const today = getTodayDate();
    return attendanceRecords.find(
      record => record.employeeId === employeeId && record.date === today
    );
  };

  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
    };
    
    setAttendanceRecords(prev => [...prev, newRecord as AttendanceRecord]);
    toast.success('Attendance record added');
  };

  const updateAttendanceRecord = (id: string, updatedFields: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === id ? { ...record, ...updatedFields } : record
      )
    );
    toast.success('Attendance record updated');
  };

  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        clockIn,
        clockOut,
        getEmployeeAttendance,
        getTodayAttendance,
        addAttendanceRecord,
        updateAttendanceRecord,
        loading,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
