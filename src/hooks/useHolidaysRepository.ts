import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface Holiday {
    id?: string;
    user_id?: string;
    date: string;
    description: string;
}

export function useHolidaysRepository(session: any, isFreePlan: boolean = false) {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHolidays = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (session && !isFreePlan) {
                const { data, error: sbError } = await supabase
                    .from('holidays')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('date', { ascending: true });

                if (sbError) throw sbError;
                setHolidays(data || []);
            } else {
                const local = localStorage.getItem('tradeJournal_holidays');
                setHolidays(local ? JSON.parse(local) : []);
            }
        } catch (err: any) {
            console.error('Error fetching holidays:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    const saveHoliday = useCallback(async (item: Holiday): Promise<Holiday | null> => {
        setIsLoading(true);
        setError(null);
        try {
            if (session && !isFreePlan) {
                const payload = { ...item, user_id: session.user.id };
                let result;
                if (payload.id) {
                    result = await supabase.from('holidays').update(payload).eq('id', payload.id).select().single();
                } else {
                    result = await supabase.from('holidays').insert(payload).select().single();
                }

                if (result.error) throw result.error;
                setHolidays(prev => {
                    const idx = prev.findIndex(p => p.id === result.data.id);
                    if (idx !== -1) {
                        const newArr = [...prev];
                        newArr[idx] = result.data;
                        return newArr;
                    }
                    return [...prev, result.data];
                });
                return result.data;
            } else {
                const current = localStorage.getItem('tradeJournal_holidays');
                const list: Holiday[] = current ? JSON.parse(current) : [];
                let savedItem;

                if (item.id) {
                    const index = list.findIndex(n => n.id === item.id);
                    if (index !== -1) {
                        list[index] = { ...item };
                        savedItem = list[index];
                    } else {
                        savedItem = { ...item, id: crypto.randomUUID() };
                        list.push(savedItem);
                    }
                } else {
                    savedItem = { ...item, id: crypto.randomUUID() };
                    list.push(savedItem);
                }

                localStorage.setItem('tradeJournal_holidays', JSON.stringify(list));
                setHolidays(list);
                return savedItem;
            }
        } catch (err: any) {
            console.error('Error saving holiday:', err);
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const deleteHoliday = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            if (session && !isFreePlan) {
                const { error: sbError } = await supabase
                    .from('holidays')
                    .delete()
                    .eq('id', id)
                    .eq('user_id', session.user.id);

                if (sbError) throw sbError;
                setHolidays(prev => prev.filter(h => h.id !== id));
                return true;
            } else {
                const current = localStorage.getItem('tradeJournal_holidays');
                if (current) {
                    const list: Holiday[] = JSON.parse(current);
                    const filtered = list.filter(n => n.id !== id);
                    localStorage.setItem('tradeJournal_holidays', JSON.stringify(filtered));
                    setHolidays(filtered);
                }
                return true;
            }
        } catch (err: any) {
            console.error('Error deleting holiday:', err);
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const overrideHolidays = useCallback((newList: Holiday[]) => {
        if (!session || isFreePlan) {
            localStorage.setItem('tradeJournal_holidays', JSON.stringify(newList));
        }
        setHolidays(newList);
    }, [session]);

    return { holidays, fetchHolidays, saveHoliday, deleteHoliday, overrideHolidays, isLoading, error };
}
