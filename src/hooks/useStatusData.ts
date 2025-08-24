import { useState, useEffect } from 'react';

export type UserStatus = 'active' | 'available-for-work' | 'not-available';

interface StatusEntry {
  status: UserStatus;
  timestamp: string;
  memo?: string;
}

interface StatusData {
  [userId: string]: StatusEntry;
}

const STORAGE_KEY = 'team_status_data';
const STATUS_HISTORY_KEY = 'status_history_data';

interface StatusHistoryEntry {
  userId: string;
  status: UserStatus;
  timestamp: string;
}

const loadStatusData = (): StatusData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading status data from localStorage:', error);
  }
  return {};
};

const loadStatusHistory = (): StatusHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(STATUS_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading status history from localStorage:', error);
  }
  return [];
};

const saveStatusData = (data: StatusData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving status data to localStorage:', error);
  }
};

const saveStatusHistory = (history: StatusHistoryEntry[]) => {
  try {
    localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving status history to localStorage:', error);
  }
};

export const useStatusData = () => {
  const [statuses, setStatuses] = useState<StatusData>(() => loadStatusData());
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>(() => loadStatusHistory());

  // Save to localStorage whenever statuses change
  useEffect(() => {
    saveStatusData(statuses);
  }, [statuses]);

  // Save status history whenever it changes
  useEffect(() => {
    saveStatusHistory(statusHistory);
  }, [statusHistory]);

  const updateStatus = (userId: string, status: UserStatus, memo?: string) => {
    const timestamp = new Date().toISOString();
    
    // Add to history
    setStatusHistory(prev => [...prev, {
      userId,
      status,
      timestamp
    }]);
    
    // Update current status
    setStatuses(prev => ({
      ...prev,
      [userId]: {
        status,
        timestamp,
        memo
      }
    }));
  };

  const getStatus = (userId: string): UserStatus => {
    return statuses[userId]?.status || 'not-available';
  };

  const getStatusTimestamp = (userId: string): string | null => {
    return statuses[userId]?.timestamp || null;
  };

  const getStatusMemo = (userId: string): string | null => {
    return statuses[userId]?.memo || null;
  };
  const getStatusHistory = (userId: string, date?: string): StatusHistoryEntry[] => {
    let history = statusHistory.filter(entry => entry.userId === userId);
    
    if (date) {
      history = history.filter(entry => 
        entry.timestamp.startsWith(date)
      );
    }
    
    return history.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  return {
    statuses,
    statusHistory,
    updateStatus,
    getStatus,
    getStatusTimestamp,
    getStatusMemo,
    getStatusHistory
  };
};