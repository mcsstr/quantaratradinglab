import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface JournalEntry {
  id: string;
  user_id?: string;
  account_id: string | null; // null means 'General'
  date: string; // YYYY-MM-DD
  sentiment: string;
  notes: string;
  tags: string;
  screenshot_url?: string;
}

export function useJournalsRepository(session: any, isFreePlan: boolean = false) {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from Supabase on init
  useEffect(() => {
    let isMounted = true;
    async function fetchJournals() {
      if (!session || isFreePlan) {
        if (isMounted) setJournals([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('journals')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) throw error;
        if (isMounted) {
          setJournals(data || []);
        }
      } catch (err) {
        console.error('Error fetching journals:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchJournals();
    return () => { isMounted = false; };
  }, [session, isFreePlan]);

  // Save to Supabase
  const saveJournal = async (journal: JournalEntry) => {
    if (!session || isFreePlan) return; // Free plan cannot use journals

    // Optimistic update locally
    setJournals(prev => {
      const idx = prev.findIndex(j => j.id === journal.id);
      if (idx >= 0) {
        const newArr = [...prev];
        newArr[idx] = journal;
        return newArr;
      }
      return [journal, ...prev];
    });

    try {
      const { error } = await supabase.from('journals').upsert({
        id: journal.id,
        user_id: session.user.id,
        account_id: journal.account_id || null,
        date: journal.date,
        sentiment: journal.sentiment,
        notes: journal.notes,
        tags: journal.tags,
        screenshot_url: journal.screenshot_url
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error saving journal to Supabase:', err);
    }
  };

  // Delete from Supabase
  const deleteJournal = async (id: string) => {
    if (!session || isFreePlan) return;
    
    // Optimistic update
    setJournals(prev => prev.filter(j => j.id !== id));

    try {
      const { error } = await supabase.from('journals').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting journal:', err);
    }
  };

  const overrideJournals = (newJournals: JournalEntry[]) => {
    setJournals(newJournals);
  };

  return { journals, saveJournal, deleteJournal, overrideJournals, isLoading };
}
