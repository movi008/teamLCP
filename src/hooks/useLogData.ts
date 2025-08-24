import { useState, useEffect, useMemo } from 'react';
import { LogEntry, FilterState } from '../types';

// Mock data matching the CSV structure
const mockLogData: LogEntry[] = [
  {
    id: '1',
    activity: 'RHB - Build Instagram Reels Transcript API',
    project: 'RHB',
    workers: 'Hasan Khan',
    duration: '07:44:31',
    duration_seconds: 27871,
    upwork_hours: 7.74,
    description: 'Built API for extracting and processing Instagram Reels transcripts',
    date: '2025-08-01'
  },
  {
    id: '2',
    activity: 'RHB - Telegram Bot',
    project: 'RHR',
    workers: 'Hasan Khan',
    duration: '10:41:55',
    duration_seconds: 38515,
    upwork_hours: 10.7,
    description: 'Developed Telegram bot with automated messaging and user interaction features',
    date: '2025-08-02'
  },
  {
    id: '3',
    activity: 'RHB - Persona Bot For Stacy Thomas',
    project: 'RHR',
    workers: 'Hasan Khan',
    duration: '21:50:41',
    duration_seconds: 78641,
    upwork_hours: 21.84,
    description: 'Created personalized AI bot for Stacy Thomas with custom personality traits',
    date: '2025-08-03'
  },
  {
    id: '4',
    activity: 'RHB - Make persona bot useing youtube transcript',
    project: 'RHR',
    workers: 'Hasan Khan',
    duration: '27:26:10',
    duration_seconds: 98770,
    upwork_hours: 27.44,
    description: 'Developed persona bot using YouTube transcript analysis for personality modeling',
    date: '2025-08-04'
  },
  {
    id: '5',
    activity: 'RHB - B2B - Lead Generation',
    project: 'RHR',
    workers: 'Hasan Khan',
    duration: '05:48:21',
    duration_seconds: 20901,
    upwork_hours: 5.81,
    description: 'Implemented B2B lead generation system with automated prospecting',
    date: '2025-08-05'
  },
  {
    id: '6',
    activity: 'RHB - AI Agent for make metada',
    project: 'RHR',
    workers: 'Hasan Khan',
    duration: '16:14:14',
    duration_seconds: 58454,
    upwork_hours: 16.24,
    description: 'Created AI agent for automated metadata generation and optimization',
    date: '2025-08-06'
  },
  {
    id: '7',
    activity: 'BAY - Personalized Listings & Buyers Roadmap',
    project: 'RHR',
    workers: 'Hasan Khan',
    duration: '06:12:17',
    duration_seconds: 22337,
    upwork_hours: 6.2,
    description: 'Developed personalized real estate listings and buyer journey roadmap',
    date: '2025-08-07'
  },
  {
    id: '8',
    activity: 'RHB - persona Bot Automation',
    project: 'RHR',
    workers: 'Rohan Mostofa',
    duration: '07:15:28',
    duration_seconds: 26128,
    upwork_hours: 7.26,
    description: 'Automated persona bot workflows and response generation',
    date: '2025-08-22'
  }
];

const STORAGE_KEY = 'daily_log_data';
const USERS_STORAGE_KEY = 'app_users_data';

const loadLogData = (): LogEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading log data from localStorage:', error);
  }
  return mockLogData;
};

const loadUsers = () => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
  }
  return [];
};

const saveLogData = (data: LogEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving log data to localStorage:', error);
  }
};
export const useLogData = (currentUserName?: string, userRole?: 'admin' | 'member' | 'viewer') => {
  const [logData, setLogData] = useState<LogEntry[]>(() => loadLogData());
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    workers: [],
    projects: []
  });

  // Save to localStorage whenever logData changes
  useEffect(() => {
    saveLogData(logData);
  }, [logData]);
  const filteredData = useMemo(() => {
    let filtered = logData;

    // Filter by current user if not admin or viewer
    if (userRole === 'member' && currentUserName) {
      filtered = filtered.filter(entry => entry.workers === currentUserName);
    }

    // Apply filters
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(entry => 
        entry.date >= filters.startDate && entry.date <= filters.endDate
      );
    } else if (filters.startDate) {
      filtered = filtered.filter(entry => entry.date >= filters.startDate);
    } else if (filters.endDate) {
      filtered = filtered.filter(entry => entry.date <= filters.endDate);
    }

    if (filters.workers.length > 0) {
      filtered = filtered.filter(entry => filters.workers.includes(entry.workers));
    }

    if (filters.month) {
      filtered = filtered.filter(entry => entry.date.startsWith(filters.month));
    }

    if (filters.projects.length > 0) {
      filtered = filtered.filter(entry => filters.projects.includes(entry.project));
    }

    return filtered;
  }, [logData, filters, currentUserName, userRole]);

  const updateDescription = (id: string, description: string) => {
    setLogData(prev => prev.map(entry => 
      entry.id === id ? { ...entry, description } : entry
    ));
  };

  const addLog = (log: Omit<LogEntry, 'id'>) => {
    const newLog: LogEntry = {
      ...log,
      id: Date.now().toString()
    };
    setLogData(prev => [newLog, ...prev]);
  };

  const deleteLog = (id: string) => {
    setLogData(prev => prev.filter(entry => entry.id !== id));
  };

  const bulkDeleteLogs = (ids: string[]) => {
    setLogData(prev => prev.filter(entry => !ids.includes(entry.id)));
  };

  const importLogs = (logs: Omit<LogEntry, 'id'>[]) => {
    const newLogs: LogEntry[] = logs.map((log, index) => ({
      ...log,
      id: `${Date.now()}-${index}`
    }));
    setLogData(prev => [...newLogs, ...prev]);
  };

  const getUniqueValues = (field: keyof LogEntry) => {
    if (field === 'workers') {
      // Get workers from both log data and user management system
      const logWorkers = [...new Set(logData.map(entry => entry[field] as string))].filter(Boolean);
      const users = loadUsers();
      const userNames = users
        .filter(user => user.role === 'member' || user.role === 'admin')
        .map(user => user.name);
      
      // Combine and deduplicate
      return [...new Set([...logWorkers, ...userNames])].filter(Boolean);
    }
    
    return [...new Set(logData.map(entry => entry[field] as string))].filter(Boolean);
  };

  const addProject = (projectName: string) => {
    // Add a dummy log entry with the new project to make it available in the project list
    // This ensures the project appears in dropdowns immediately
    const dummyLog: LogEntry = {
      id: `project-${Date.now()}`,
      activity: `Project ${projectName} created`,
      project: projectName,
      workers: 'System',
      duration: '00:00:01',
      duration_seconds: 1,
      upwork_hours: 0,
      description: 'Project created via project management',
      date: new Date().toISOString().split('T')[0]
    };
    
    setLogData(prev => [dummyLog, ...prev]);
  };

  const removeProject = (projectName: string) => {
    // Remove all logs with this project
    setLogData(prev => prev.filter(entry => entry.project !== projectName));
  };
  const exportToCSV = () => {
    const headers = [
      'Date', 'Project', 'Worker', 'Activity', 'Hours'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(entry => [
        entry.date,
        entry.project,
        entry.workers,
        `"${entry.activity}"`,
        entry.duration
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return {
    logData: filteredData,
    filters,
    setFilters,
    updateDescription,
    addLog,
    deleteLog,
    bulkDeleteLogs,
    importLogs,
    getUniqueValues,
    exportToCSV,
    addProject,
    removeProject
  };
};