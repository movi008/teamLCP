import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CheckinEntry {
  id: string;
  memberName: string;
  project: string;
  task: string;
  timestamp: string;
}

export const useMorningCheckinData = () => {
  const [checkins, setCheckins] = useState<CheckinEntry[]>([]);

  // Load checkin data from Supabase
  useEffect(() => {
    loadCheckinData();
  }, []);

  const loadCheckinData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('morning_checkins')
        .select('*')
        .gte('timestamp', `${today}T00:00:00.000Z`)
        .lt('timestamp', `${today}T23:59:59.999Z`)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const formattedCheckins: CheckinEntry[] = (data || []).map(checkin => ({
        id: checkin.id,
        memberName: checkin.member_name,
        project: checkin.project,
        task: checkin.task,
        timestamp: checkin.timestamp
      }));

      setCheckins(formattedCheckins);
    } catch (error) {
      console.error('Error loading checkin data:', error);
    }
  };

  const addCheckin = async (checkin: Omit<CheckinEntry, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('morning_checkins')
        .insert({
          member_name: checkin.memberName,
          project: checkin.project,
          task: checkin.task,
          timestamp: checkin.timestamp
        })
        .select()
        .single();

      if (error) throw error;

      const newCheckin: CheckinEntry = {
        id: data.id,
        memberName: data.member_name,
        project: data.project,
        task: data.task,
        timestamp: data.timestamp
      };

      setCheckins(prev => [newCheckin, ...prev]);
    } catch (error) {
      console.error('Error adding checkin:', error);
    }
  };

  const removeCheckin = async (id: string) => {
    try {
      const { error } = await supabase
        .from('morning_checkins')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCheckins(prev => prev.filter(checkin => checkin.id !== id));
    } catch (error) {
      console.error('Error removing checkin:', error);
    }
  };

  return {
    checkins,
    addCheckin,
    removeCheckin
  };
};