export interface LogEntry {
  id: string;
  activity: string;
  project: string;
  workers: string;
  duration: string;
  duration_seconds: number;
  upwork_hours: number;
  description: string;
  date: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
  password?: string;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  workers: string[];
  projects: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}