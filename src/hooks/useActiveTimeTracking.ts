import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useStatusData } from './useStatusData';

interface ActiveTimeSession {
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
  const [, forceUpdate] = useState({});

  // Get active time data from localStorage
  const getActiveTimeData = (): ActiveTimeEntry[] => {
    try {
      const stored = localStorage.getItem('active_time_data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading active time data:', error);
    }
    return [];
  };

  // Save active time data to localStorage
  const saveActiveTimeData = (data: ActiveTimeEntry[]) => {
    try {
      localStorage.setItem('active_time_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving active time data:', error);
    }
  };

  // Track status changes and manage sessions
  useEffect(() => {
    const checkStatusChanges = () => {
      const today = new Date().toISOString().split('T')[0];
      let activeTimeData = getActiveTimeData();
      let hasChanges = false;

      allUsers.forEach(user => {
        const currentStatus = getStatus(user.id);
        const currentMemo = getStatusMemo(user.id);
        const lastStatus = lastStatusCheck[user.id];
        
        // Process status changes
        if (lastStatus !== currentStatus) {
          // Find or create user's entry for today
          let userEntry = activeTimeData.find(entry => 
            entry.userId === user.id && entry.date === today
          );
          
          if (!userEntry) {
            userEntry = {
              userId: user.id,
              date: today,
              sessions: [],
              totalSeconds: 0
            };
            activeTimeData.push(userEntry);
          }

          // End current session if user was active and is changing status to non-active
          if (lastStatus === 'active' && currentStatus !== 'active') {
            const currentSession = userEntry.sessions.find(s => !s.endTime);
            if (currentSession) {
              const now = new Date().toISOString();
              const startTime = new Date(currentSession.startTime);
              const endTime = new Date(now);
              const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
              
              currentSession.endTime = now;
              currentSession.durationSeconds = Math.max(0, durationSeconds);
              userEntry.totalSeconds += Math.max(0, durationSeconds);
              hasChanges = true;
            }
          }

          // Start new session if becoming active
          if (currentStatus === 'active' && lastStatus !== 'active') {
            const ongoingSession = userEntry.sessions.find(s => !s.endTime);
            if (!ongoingSession) {
              const newSession: ActiveTimeSession = {
                startTime: new Date().toISOString(),
                durationSeconds: 0,
                memo: currentMemo || 'Working'
              };
              userEntry.sessions.push(newSession);
              hasChanges = true;
            }
          }
          
          // Update last status check for any status change
          setLastStatusCheck(prev => ({
            ...prev,
            [user.id]: currentStatus
          }));
        }
        
        // Handle memo changes for active users (separate from status changes)
        if (currentStatus === 'active' && lastStatus === 'active' && currentMemo) {
          let userEntry = activeTimeData.find(entry => 
            entry.userId === user.id && entry.date === today
          );
          
          if (userEntry) {
            const ongoingSession = userEntry.sessions.find(s => !s.endTime);
            
            // If memo changed and there's an ongoing session, end it and start new one
            if (ongoingSession && ongoingSession.memo !== currentMemo) {
              const now = new Date().toISOString();
              const startTime = new Date(ongoingSession.startTime);
              const endTime = new Date(now);
              const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
              
              ongoingSession.endTime = now;
              ongoingSession.durationSeconds = Math.max(0, durationSeconds);
              userEntry.totalSeconds += Math.max(0, durationSeconds);
              
              // Create new session with new memo
              const newSession: ActiveTimeSession = {
                startTime: new Date().toISOString(),
                durationSeconds: 0,
                memo: currentMemo
              };
              userEntry.sessions.push(newSession);
              hasChanges = true;
            }
          }
        }
      });

      if (hasChanges) {
        saveActiveTimeData(activeTimeData);
        // Force UI update immediately when sessions change
        forceUpdate({});
      }
    };

    const interval = setInterval(checkStatusChanges, 500);
    checkStatusChanges(); // Initial check
    
    return () => clearInterval(interval);
  }, [allUsers, getStatus, getStatusMemo, lastStatusCheck]);

  // Update ongoing sessions every second for live time display
  useEffect(() => {
    const updateOngoingSessions = () => {
      const today = new Date().toISOString().split('T')[0];
      let activeTimeData = getActiveTimeData();
      let hasChanges = false;

      allUsers.forEach(user => {
        const currentStatus = getStatus(user.id);
        
        // Only update ongoing sessions for users who are actually active
        if (currentStatus === 'active') {
          let userEntry = activeTimeData.find(entry => 
            entry.userId === user.id && entry.date === today
          );
          
          if (userEntry) {
            const currentSession = userEntry.sessions.find(s => !s.endTime);
            if (currentSession) {
              const now = new Date();
              const startTime = new Date(currentSession.startTime);
              const currentDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
              
              if (currentDuration >= 0 && currentDuration !== currentSession.durationSeconds) {
                currentSession.durationSeconds = currentDuration;
                hasChanges = true;
              }
            }
          }
        }
      });

      if (hasChanges) {
        saveActiveTimeData(activeTimeData);
        // Force UI update for live time counting
        forceUpdate({});
      }
    };

    const interval = setInterval(updateOngoingSessions, 500);
    updateOngoingSessions(); // Run immediately
    return () => clearInterval(interval);
  }, [allUsers, getStatus]);

  // Format duration in human readable format
  const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) {
      return '0s';
    }
    
    seconds = Math.floor(seconds); // Ensure integer
    
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
    const activeTimeData = getActiveTimeData();
    const userEntry = activeTimeData.find(entry => 
      entry.userId === userId && entry.date === date
    );
    
    if (!userEntry) return 0;
    
    // Calculate total from completed sessions
    let totalTime = 0;
    userEntry.sessions.forEach(session => {
      if (session.endTime) {
        totalTime += session.durationSeconds || 0;
      }
    });
    
    // Add current session time if user is currently active
    const currentStatus = getStatus(userId);
    if (currentStatus === 'active') {
      const currentSession = userEntry.sessions.find(s => !s.endTime);
      if (currentSession) {
        const now = new Date();
        const startTime = new Date(currentSession.startTime);
        const currentSessionTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        if (!isNaN(currentSessionTime) && currentSessionTime >= 0 && isFinite(currentSessionTime)) {
          totalTime += currentSessionTime;
        }
      }
    }
    
    return Math.max(0, totalTime);
  };

  // Get all users' active time data for a specific date
  const getAllUsersActiveTimeForDate = (date: string) => {
    const activeTimeData = getActiveTimeData();
    
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
    getActiveTimeData,
    activeTimeData: getActiveTimeData()
  };
};