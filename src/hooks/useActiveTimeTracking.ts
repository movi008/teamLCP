import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useStatusData } from './useStatusData';

interface ActiveTimeSession {
  id?: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  memo?: string;
}

interface ActiveTimeEntry {
  userId: string;
  date: string;
  sessions: ActiveTimeSession[];
  totalSeconds: number;
}

export const useActiveTimeTracking = () => {
  const { allUsers } = useAuth();
  const { getStatus, getStatusMemo } = useStatusData();
  const [lastStatusCheck, setLastStatusCheck] = useState<{[userId: string]: string}>({});
  const [activeTimeData, setActiveTimeData] = useState<ActiveTimeEntry[]>([]);
  const [, forceUpdate] = useState({});

  // Load active time data from Supabase
  useEffect(() => {
    loadActiveTimeData();
  }, []);

  const loadActiveTimeData = async () => {
    try {
      const { data, error } = await supabase
        .from('active_time_sessions')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;

      // Group sessions by user and date
      const groupedData: { [key: string]: ActiveTimeEntry } = {};

      (data || []).forEach(session => {
        const key = `${session.user_id}-${session.date}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            userId: session.user_id,
            date: session.date,
            sessions: [],
            totalSeconds: 0
          };
        }

        const sessionData: ActiveTimeSession = {
          id: session.id,
          startTime: session.start_time,
          endTime: session.end_time,
          durationSeconds: session.duration_seconds,
          memo: session.memo
        };

        groupedData[key].sessions.push(sessionData);
        if (session.end_time) {
          groupedData[key].totalSeconds += session.duration_seconds;
        }
      });

      setActiveTimeData(Object.values(groupedData));
    } catch (error) {
      console.error('Error loading active time data:', error);
    }
  };

  // Track status changes and manage sessions
  useEffect(() => {
    const checkStatusChanges = async () => {
      const today = new Date().toISOString().split('T')[0];
      let hasChanges = false;

      for (const user of allUsers) {
        const currentStatus = getStatus(user.id);
        const currentMemo = getStatusMemo(user.id);
        const lastStatus = lastStatusCheck[user.id];
        
        // Process status changes
        if (lastStatus !== currentStatus) {
          // End current session if user was active and is changing status to non-active
          if (lastStatus === 'active' && currentStatus !== 'active') {
            await endActiveSession(user.id, today);
            hasChanges = true;
          }

          // Start new session if becoming active
          if (currentStatus === 'active' && lastStatus !== 'active') {
            await startActiveSession(user.id, today, currentMemo || 'Working');
            hasChanges = true;
          }
          
          // Update last status check
          setLastStatusCheck(prev => ({
            ...prev,
            [user.id]: currentStatus
          }));
        }
        
        // Handle memo changes for active users
        if (currentStatus === 'active' && lastStatus === 'active' && currentMemo) {
          const hasOngoingSession = await checkOngoingSession(user.id, today);
          if (hasOngoingSession) {
            const currentSession = await getCurrentSession(user.id, today);
            if (currentSession && currentSession.memo !== currentMemo) {
              await endActiveSession(user.id, today);
              await startActiveSession(user.id, today, currentMemo);
              hasChanges = true;
            }
          }
        }
      }

      if (hasChanges) {
        await loadActiveTimeData();
        forceUpdate({});
      }
    };

    const interval = setInterval(checkStatusChanges, 1000);
    checkStatusChanges(); // Initial check
    
    return () => clearInterval(interval);
  }, [allUsers, getStatus, getStatusMemo, lastStatusCheck]);

  const startActiveSession = async (userId: string, date: string, memo: string) => {
    try {
      const { error } = await supabase
        .from('active_time_sessions')
        .insert({
          user_id: userId,
          date,
          start_time: new Date().toISOString(),
          memo,
          duration_seconds: 0
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error starting active session:', error);
    }
  };

  const endActiveSession = async (userId: string, date: string) => {
    try {
      // Find the ongoing session
      const { data: sessions, error: fetchError } = await supabase
        .from('active_time_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        const now = new Date().toISOString();
        const startTime = new Date(session.start_time);
        const endTime = new Date(now);
        const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        const { error: updateError } = await supabase
          .from('active_time_sessions')
          .update({
            end_time: now,
            duration_seconds: Math.max(0, durationSeconds)
          })
          .eq('id', session.id);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error ending active session:', error);
    }
  };

  const checkOngoingSession = async (userId: string, date: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('active_time_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .is('end_time', null)
        .limit(1);

      if (error) throw error;
      return (data || []).length > 0;
    } catch (error) {
      console.error('Error checking ongoing session:', error);
      return false;
    }
  };

  const getCurrentSession = async (userId: string, date: string) => {
    try {
      const { data, error } = await supabase
        .from('active_time_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  };

  // Format duration in human readable format
  const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) {
      return '0s';
    }
    
    seconds = Math.floor(seconds);
    
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    
    return `${hours}h`;
  };

  // Get user's total active time for a specific date
  const getUserActiveTimeForDate = (userId: string, date: string): number => {
    const userEntry = activeTimeData.find(entry => 
      entry.userId === userId && entry.date === date
    );
    
    if (!userEntry) return 0;
    
    let totalTime = 0;
    userEntry.sessions.forEach(session => {
      if (session.endTime) {
        totalTime += session.durationSeconds || 0;
      } else {
        // Calculate current session time if ongoing
        const currentStatus = getStatus(userId);
        if (currentStatus === 'active') {
          const now = new Date();
          const startTime = new Date(session.startTime);
          const currentSessionTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          if (!isNaN(currentSessionTime) && currentSessionTime >= 0 && isFinite(currentSessionTime)) {
            totalTime += currentSessionTime;
          }
        }
      }
    });
    
    return Math.max(0, totalTime);
  };

  // Get all users' active time data for a specific date
  const getAllUsersActiveTimeForDate = (date: string) => {
    return allUsers.map(user => {
      const userEntry = activeTimeData.find(entry => 
        entry.userId === user.id && entry.date === date
      );
      
      const activeSeconds = getUserActiveTimeForDate(user.id, date);
      
      return {
        userId: user.id,
        userName: user.name,
        activeSeconds,
        date,
        sessions: userEntry?.sessions || []
      };
    });
  };

  // Check if user is currently active
  const isUserCurrentlyActive = (userId: string): boolean => {
    return getStatus(userId) === 'active';
  };

  // Get list of currently active users
  const getCurrentActiveUsers = () => {
    return allUsers.filter(user => getStatus(user.id) === 'active');
  };

  return {
    formatDuration,
    getUserActiveTimeForDate,
    getAllUsersActiveTimeForDate,
    isUserCurrentlyActive,
    getCurrentActiveUsers,
    getActiveTimeData: () => activeTimeData,
    activeTimeData
  };
};