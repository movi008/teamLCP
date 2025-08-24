import { useState, useEffect } from 'react';

export type Timezone = 'Bangladesh' | 'Slovakia';

const TIMEZONE_MAP = {
  'Bangladesh': 'Asia/Dhaka',
  'Slovakia': 'Europe/Bratislava'
};

const STORAGE_KEY = 'selected_timezone';

export const useTimezone = () => {
  const [selectedTimezone, setSelectedTimezone] = useState<Timezone>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === 'Bangladesh' || stored === 'Slovakia')) {
        return stored as Timezone;
      }
    } catch (error) {
      console.error('Error loading timezone from localStorage:', error);
    }
    return 'Bangladesh'; // Default to Bangladesh
  });

  // Save to localStorage whenever timezone changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, selectedTimezone);
    } catch (error) {
      console.error('Error saving timezone to localStorage:', error);
    }
  }, [selectedTimezone]);

  const formatTime = (timestamp: string): string => {
    if (!timestamp) return 'Never updated';
    
    try {
      const date = new Date(timestamp);
      const timeZone = TIMEZONE_MAP[selectedTimezone];
      
      return date.toLocaleTimeString('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const getTimezoneAbbreviation = (): string => {
    switch (selectedTimezone) {
      case 'Bangladesh':
        return 'BST';
      case 'Slovakia':
        return 'CET';
      default:
        return '';
    }
  };

  return {
    selectedTimezone,
    setSelectedTimezone,
    formatTime,
    getTimezoneAbbreviation,
    availableTimezones: ['Bangladesh', 'Slovakia'] as Timezone[]
  };
};