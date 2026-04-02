import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface Setup {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  images: string[];
}

export function useSetupsRepository(session: any) {
  const [setups, setSetups] = useState<Setup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from Supabase on init
  useEffect(() => {
    let isMounted = true;
    async function fetchSetups() {
      if (!session) {
        if (isMounted) setSetups([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('setups')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (isMounted) {
          setSetups(data || []);
        }
      } catch (err) {
        console.error('Error fetching setups:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchSetups();
    return () => { isMounted = false; };
  }, [session]);

  // Save to Supabase
  const saveSetup = async (setup: Setup) => {
    if (!session) return;
    
    setSetups(prev => {
      const idx = prev.findIndex(s => s.id === setup.id);
      if (idx >= 0) {
        const newArr = [...prev];
        newArr[idx] = setup;
        return newArr;
      }
      return [setup, ...prev];
    });

    try {
      const { error } = await supabase.from('setups').upsert({
        id: setup.id,
        user_id: session.user.id,
        title: setup.title,
        description: setup.description,
        images: setup.images
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error saving setup:', err);
    }
  };

  // Delete from Supabase
  const deleteSetup = async (id: string) => {
    if (!session) return;
    setSetups(prev => prev.filter(s => s.id !== id));
    try {
      const { error } = await supabase.from('setups').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting setup:', err);
    }
  };

  const overrideSetups = (newSetups: Setup[]) => {
    setSetups(newSetups);
  };

  return { setups, saveSetup, deleteSetup, overrideSetups, isLoading };
}
