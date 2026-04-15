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
  commission?: number;
  group_name?: string;
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
        win_rate: target.win_rate,
        commission: target.commission ?? 0
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error saving setup target:', err);
    }
  };

  const deleteSetupTarget = async (idOrIds: string | string[]) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    
    if (storageMode === 'local') {
      setSetupTargets(prev => {
        const newArr = prev.filter(s => !ids.includes(s.id));
        localStorage.setItem('quantara_setup_targets', JSON.stringify(newArr));
        return newArr;
      });
      return;
    }

    if (!session) return;
    setSetupTargets(prev => prev.filter(s => !ids.includes(s.id)));
    try {
      const { error } = await supabase.from('setup_targets').delete().in('id', ids);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting setup target(s):', err);
    }
  };

  const overrideSetupTargets = (newTargets: SetupTarget[]) => {
    setSetupTargets(newTargets);
    if (storageMode === 'local') {
       localStorage.setItem('quantara_setup_targets', JSON.stringify(newTargets));
    }
  };

  const saveBatchSetupTargets = async (targets: SetupTarget[], setup_id: string, group_name: string, original_group_name?: string) => {
    const targetGroupNameToDelete = original_group_name !== undefined ? original_group_name : group_name;

    if (storageMode === 'local') {
      setSetupTargets(prev => {
        // delete old targeting this group or original group
        const filtered = prev.filter(s => !(s.setup_id === setup_id && (s.group_name === group_name || s.group_name === targetGroupNameToDelete)));
        const newArr = [...targets, ...filtered];
        localStorage.setItem('quantara_setup_targets', JSON.stringify(newArr));
        return newArr;
      });
      return;
    }

    if (!session) return;
    
    // Optimistic update
    setSetupTargets(prev => {
      const filtered = prev.filter(s => !(s.setup_id === setup_id && (s.group_name === group_name || s.group_name === targetGroupNameToDelete)));
      return [...targets, ...filtered];
    });

    try {
      // Delete old targets matching group and setup
      // Handle case where group_name may be null in older records
      let delQuery = supabase
        .from('setup_targets')
        .delete()
        .eq('setup_id', setup_id);
      
      if (targetGroupNameToDelete) {
        delQuery = delQuery.eq('group_name', targetGroupNameToDelete);
      } else {
        delQuery = delQuery.is('group_name', null);
      }
        
      const { error: delError } = await delQuery;
        
      if (delError) throw delError;

      if (targets.length > 0) {
        const insertPayload = targets.map(t => ({
          id: t.id,
          user_id: session.user.id,
          setup_id: t.setup_id,
          account_id: t.account_id,
          date: t.date,
          asset_str: t.asset_str,
          takes: t.takes,
          stops: t.stops,
          pnl: t.pnl,
          win_rate: t.win_rate,
          commission: t.commission ?? 0,
          group_name: t.group_name
        }));
        const { error: insError } = await supabase.from('setup_targets').upsert(insertPayload);
        if (insError) throw insError;
      }
    } catch (err) {
      console.error('Error saving batch setup targets:', err);
    }
  };

  return { setupTargets, saveSetupTarget, deleteSetupTarget, overrideSetupTargets, saveBatchSetupTargets, isLoading };
}

