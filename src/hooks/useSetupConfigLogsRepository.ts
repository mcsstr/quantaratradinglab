import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface SetupConfigLog {
  id: string;
  user_id?: string;
  setup_id: string;
  date: string;
  notes: string;
  created_at?: string;
  group_name?: string;
}

export function useSetupConfigLogsRepository(session: any, storageMode: 'local' | 'supabase') {
  const [setupConfigLogs, setSetupConfigLogs] = useState<SetupConfigLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLogs() {
      if (storageMode === 'local') {
        const local = localStorage.getItem('quantara_setup_config_logs');
        if (local && isMounted) {
          try {
            setSetupConfigLogs(JSON.parse(local));
          } catch (err) {}
        }
        return;
      }

      if (!session) {
        if (isMounted) setSetupConfigLogs([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('setup_config_logs')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) throw error;
        if (isMounted) {
          setSetupConfigLogs(data || []);
        }
      } catch (err) {
        console.error('Error fetching setup config logs:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchLogs();
    return () => { isMounted = false; };
  }, [session, storageMode]);

  // Append-only history — always inserts a new record
  const addSetupConfigLog = async (log: Omit<SetupConfigLog, 'id'> & { id?: string }) => {
    const newLog: SetupConfigLog = {
      ...log,
      id: log.id || crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    if (storageMode === 'local') {
      setSetupConfigLogs(prev => {
        const newArr = [newLog, ...prev];
        localStorage.setItem('quantara_setup_config_logs', JSON.stringify(newArr));
        return newArr;
      });
      return;
    }

    if (!session) return;
    
    setSetupConfigLogs(prev => [newLog, ...prev]);

    try {
      const { error } = await supabase.from('setup_config_logs').insert({
        id: newLog.id,
        user_id: session.user.id,
        setup_id: newLog.setup_id,
        date: newLog.date,
        notes: newLog.notes,
        group_name: newLog.group_name
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error adding setup config log:', err);
    }
  };

  // Update notes of an existing log entry
  const updateSetupConfigLog = async (id: string, notes: string) => {
    setSetupConfigLogs(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
    if (storageMode === 'local') {
      setSetupConfigLogs(prev => {
        const updated = prev.map(l => l.id === id ? { ...l, notes } : l);
        localStorage.setItem('quantara_setup_config_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    if (!session) return;
    try {
      const { error } = await supabase.from('setup_config_logs').update({ notes }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating setup config log:', err);
    }
  };

  const overrideSetupConfigLogs = (newLogs: SetupConfigLog[]) => {
    setSetupConfigLogs(newLogs);
    if (storageMode === 'local') {
       localStorage.setItem('quantara_setup_config_logs', JSON.stringify(newLogs));
    }
  };

  return { setupConfigLogs, addSetupConfigLog, updateSetupConfigLog, overrideSetupConfigLogs, isLoading };
}
