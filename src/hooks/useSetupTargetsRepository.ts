import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface SetupTarget {
  id: string;
  user_id?: string;
  setup_id: string;
  account_id?: string;
  date: string;
  asset_str: string;
  takes: number;
  stops: number;
  pnl: number;
  win_rate: number;
}

export function useSetupTargetsRepository(session: any, storageMode: 'local' | 'supabase') {
  const [setupTargets, setSetupTargets] = useState<SetupTarget[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchTargets() {
      if (storageMode === 'local') {
        const local = localStorage.getItem('quantara_setup_targets');
        if (local && isMounted) {
          try {
            setSetupTargets(JSON.parse(local));
          } catch (err) {}
        }
        return;
      }

      if (!session) {
        if (isMounted) setSetupTargets([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('setup_targets')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) throw error;
        if (isMounted) {
          setSetupTargets(data || []);
        }
      } catch (err) {
        console.error('Error fetching setup targets:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchTargets();
    return () => { isMounted = false; };
  }, [session, storageMode]);

  const saveSetupTarget = async (target: SetupTarget) => {
    if (storageMode === 'local') {
      setSetupTargets(prev => {
        const newArr = [target, ...prev];
        localStorage.setItem('quantara_setup_targets', JSON.stringify(newArr));
        return newArr;
      });
      return;
    }

    if (!session) return;
    
    setSetupTargets(prev => {
      const idx = prev.findIndex(s => s.id === target.id);
      if (idx >= 0) {
        const newArr = [...prev];
        newArr[idx] = target;
        return newArr;
      }
      return [target, ...prev];
    });

    try {
      const { error } = await supabase.from('setup_targets').upsert({
        id: target.id,
        user_id: session.user.id,
        setup_id: target.setup_id,
        account_id: target.account_id,
        date: target.date,
        asset_str: target.asset_str,
        takes: target.takes,
        stops: target.stops,
        pnl: target.pnl,
        win_rate: target.win_rate
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error saving setup target:', err);
    }
  };

  const deleteSetupTarget = async (id: string) => {
    if (storageMode === 'local') {
      setSetupTargets(prev => {
        const newArr = prev.filter(s => s.id !== id);
        localStorage.setItem('quantara_setup_targets', JSON.stringify(newArr));
        return newArr;
      });
      return;
    }

    if (!session) return;
    setSetupTargets(prev => prev.filter(s => s.id !== id));
    try {
      const { error } = await supabase.from('setup_targets').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting setup target:', err);
    }
  };

  const overrideSetupTargets = (newTargets: SetupTarget[]) => {
    setSetupTargets(newTargets);
    if (storageMode === 'local') {
       localStorage.setItem('quantara_setup_targets', JSON.stringify(newTargets));
    }
  };

  return { setupTargets, saveSetupTarget, deleteSetupTarget, overrideSetupTargets, isLoading };
}
