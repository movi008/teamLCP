import { useState, useEffect } from 'react';

export interface CheckinEntry {
  id: string;
  memberName: string;
  project: string;
  task: string;
  timestamp: string;
}

const STORAGE_KEY = 'morning_checkin_data';

const loadCheckinData = (): CheckinEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading checkin data from localStorage:', error);
  }
  return [];
};

const saveCheckinData = (data: CheckinEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving checkin data to localStorage:', error);
  }
};

export const useMorningCheckinData = () => {
  const [checkins, setCheckins] = useState<CheckinEntry[]>(() => loadCheckinData());

  // Save to localStorage whenever checkins change
  useEffect(() => {
    saveCheckinData(checkins);
  }, [checkins]);

  const addCheckin = (checkin: Omit<CheckinEntry, 'id'>) => {
    const newCheckin: CheckinEntry = {
      ...checkin,
      id: Date.now().toString()
    };
    setCheckins(prev => [newCheckin, ...prev]);
  };

  const removeCheckin = (id: string) => {
    setCheckins(prev => prev.filter(checkin => checkin.id !== id));
  };


  // Get today's checkins only
  const todayCheckins = checkins.filter(checkin => {
    const checkinDate = new Date(checkin.timestamp).toDateString();
    const today = new Date().toDateString();
    return checkinDate === today;
  });

  return {
    checkins: todayCheckins,
    addCheckin,
    removeCheckin
  };
};