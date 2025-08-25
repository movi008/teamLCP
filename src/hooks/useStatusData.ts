import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserStatus = 'active' | 'available-for-work' | 'not-available';

interface StatusEntry {
  status: UserStatus;
  timestamp: string;
  memo?: string;
}

interface StatusData {
  [userId: string]: StatusEntry;
}

interface StatusHistoryEntry {
  userId: string;
  status: UserStatus;
  timestamp: string;
}

export const useStatusData = () => {
  const [statuses, setStatuses] = useState<StatusData>({});
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);

  // Load status data from Supabase
  useEffect(() => {
    loadStatusData();
  }, []);

  const loadStatusData = async () => {
    try {
      // Get latest status for each user
      const { data: statusData, error } = await supabase
        .from('user_status')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by user_id and get the latest status for each user
      const latestStatuses: StatusData = {};
      const history: StatusHistoryEntry[] = [];

      (statusData || []).forEach(status => {
        // Add to history
        history.push({
          userId: status.user_id,
          status: status.status,
          timestamp: status.timestamp
        });

        // Keep only the latest status for each user
        if (!latestStatuses[status.user_id]) {
          latestStatuses[status.user_id] = {
            status: status.status,
            timestamp: status.timestamp,
            memo: status.memo
          };
        }
      });

      setStatuses(latestStatuses);
      setStatusHistory(history);
    } catch (error) {
      console.error('Error loading status data:', error);
    }
  };

  const updateStatus = async (userId: string, status: UserStatus, memo?: string) => {
    // Validate UUID format
    if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error('Invalid UUID format for user ID:', userId);
      return false;
    }
    
    try {
      const timestamp = new Date().toISOString();
      
      // Insert new status record
      const { error } = await supabase
        .from('user_status')
        .insert({
          user_id: userId,
          status,
          memo,
          timestamp
        });

      if (error) throw error;

      // Update local state
      setStatuses(prev => ({
        ...prev,
        [userId]: {
          status,
          timestamp,
          memo
        }
      }));

      setStatusHistory(prev => [...prev, {
        userId,
        status,
        timestamp
      }]);
      
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
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