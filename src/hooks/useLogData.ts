import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { LogEntry, FilterState } from '../types';

export const useLogData = (currentUserName?: string, userRole?: 'admin' | 'member' | 'viewer') => {
  const [logData, setLogData] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    workers: [],
    projects: []
  });
  const [loading, setLoading] = useState(true);

  // Load log data from Supabase
  useEffect(() => {
    loadLogData();
  }, []);

  const loadLogData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('log_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedData: LogEntry[] = (data || []).map(entry => ({
        id: entry.id,
        activity: entry.activity,
        project: entry.project,
        workers: entry.workers,
        duration: entry.duration,
        duration_seconds: entry.duration_seconds,
        upwork_hours: entry.upwork_hours,
        description: entry.description,
        date: entry.date
      }));

      setLogData(formattedData);
    } catch (error) {
      console.error('Error loading log data:', error);
    } finally {
      setLoading(false);
    }
  };

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

    if (filters.projects.length > 0) {
      filtered = filtered.filter(entry => filters.projects.includes(entry.project));
    }

    return filtered;
  }, [logData, filters, currentUserName, userRole]);

  const updateDescription = async (id: string, description: string) => {
    try {
      const { error } = await supabase
        .from('log_entries')
        .update({ 
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setLogData(prev => prev.map(entry => 
        entry.id === id ? { ...entry, description } : entry
      ));
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const addLog = async (log: Omit<LogEntry, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('log_entries')
        .insert({
          activity: log.activity,
          project: log.project,
          workers: log.workers,
          duration: log.duration,
          duration_seconds: log.duration_seconds,
          upwork_hours: log.upwork_hours,
          description: log.description,
          date: log.date
        })
        .select()
        .single();

      if (error) throw error;

      const newLog: LogEntry = {
        id: data.id,
        activity: data.activity,
        project: data.project,
        workers: data.workers,
        duration: data.duration,
        duration_seconds: data.duration_seconds,
        upwork_hours: data.upwork_hours,
        description: data.description,
        date: data.date
      };

      setLogData(prev => [newLog, ...prev]);
      return true;
    } catch (error) {
      console.error('Error adding log:', error);
      return false;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('log_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLogData(prev => prev.filter(entry => entry.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting log:', error);
      return false;
    }
  };

  const bulkDeleteLogs = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('log_entries')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setLogData(prev => prev.filter(entry => !ids.includes(entry.id)));
      return true;
    } catch (error) {
      console.error('Error bulk deleting logs:', error);
      return false;
    }
  };

  const importLogs = async (logs: Omit<LogEntry, 'id'>[]) => {
    try {
      const { data, error } = await supabase
        .from('log_entries')
        .insert(logs.map(log => ({
          activity: log.activity,
          project: log.project,
          workers: log.workers,
          duration: log.duration,
          duration_seconds: log.duration_seconds,
          upwork_hours: log.upwork_hours,
          description: log.description,
          date: log.date
        })))
        .select();

      if (error) throw error;

      const newLogs: LogEntry[] = (data || []).map(entry => ({
        id: entry.id,
        activity: entry.activity,
        project: entry.project,
        workers: entry.workers,
        duration: entry.duration,
        duration_seconds: entry.duration_seconds,
        upwork_hours: entry.upwork_hours,
        description: entry.description,
        date: entry.date
      }));

      setLogData(prev => [...newLogs, ...prev]);
    } catch (error) {
      console.error('Error importing logs:', error);
    }
  };

  const getUniqueValues = (field: keyof LogEntry) => {
    if (field === 'workers') {
      // Get workers from log data
      return [...new Set(logData.map(entry => entry[field] as string))].filter(Boolean);
    }
    
    return [...new Set(logData.map(entry => entry[field] as string))].filter(Boolean);
  };

  const addProject = async (projectName: string) => {
    try {
      // Create a dummy log entry to establish the project in the system
      const { error } = await supabase
        .from('log_entries')
        .insert({
          activity: `Project ${projectName} created`,
          project: projectName,
          workers: 'System',
          duration: '00:00:01',
          duration_seconds: 1,
          upwork_hours: 0,
          description: 'Project initialization entry',
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      
      await loadLogData(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error adding project:', error);
      return false;
    }
  };

  const removeProject = async (projectName: string) => {
    // Remove all logs with this project
    try {
      const { error } = await supabase
        .from('log_entries')
        .delete()
        .eq('project', projectName);

      if (error) throw error;

      setLogData(prev => prev.filter(entry => entry.project !== projectName));
      return true;
    } catch (error) {
      console.error('Error removing project:', error);
      return false;
    }
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
    removeProject,
    loading
  };
};