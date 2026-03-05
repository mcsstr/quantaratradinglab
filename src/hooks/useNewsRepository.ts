import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface News {
    id?: string;
    user_id?: string;
    date: string;
    time: string;
    currency: string;
    impact: string;
    description: string;
}

export function useNewsRepository(session: any) {
    const [news, setNews] = useState<News[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (session) {
                const { data, error: sbError } = await supabase
                    .from('news')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('date', { ascending: true });

                if (sbError) throw sbError;
                setNews(data || []);
            } else {
                const local = localStorage.getItem('news_list_v1');
                setNews(local ? JSON.parse(local) : []);
            }
        } catch (err: any) {
            console.error('Error fetching news:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const saveNews = useCallback(async (item: News): Promise<News | null> => {
        setIsLoading(true);
        setError(null);
        try {
            if (session) {
                const payload = { ...item, user_id: session.user.id };
                let result;

                if (payload.id) {
                    result = await supabase.from('news').update(payload).eq('id', payload.id).select().single();
                } else {
                    result = await supabase.from('news').insert(payload).select().single();
                }

                if (result.error) throw result.error;
                setNews(prev => {
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
                const current = localStorage.getItem('news_list_v1');
                const newsList: News[] = current ? JSON.parse(current) : [];
                let savedItem;

                if (item.id) {
                    const index = newsList.findIndex(n => n.id === item.id);
                    if (index !== -1) {
                        newsList[index] = { ...item };
                        savedItem = newsList[index];
                    } else {
                        savedItem = { ...item, id: crypto.randomUUID() };
                        newsList.push(savedItem);
                    }
                } else {
                    savedItem = { ...item, id: crypto.randomUUID() };
                    newsList.push(savedItem);
                }

                localStorage.setItem('news_list_v1', JSON.stringify(newsList));
                setNews(newsList);
                return savedItem;
            }
        } catch (err: any) {
            console.error('Error saving news:', err);
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const deleteNews = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            if (session) {
                const { error: sbError } = await supabase
                    .from('news')
                    .delete()
                    .eq('id', id)
                    .eq('user_id', session.user.id);

                if (sbError) throw sbError;
                setNews(prev => prev.filter(n => n.id !== id));
                return true;
            } else {
                const current = localStorage.getItem('news_list_v1');
                if (current) {
                    const newsList: News[] = JSON.parse(current);
                    const filtered = newsList.filter(n => n.id !== id);
                    localStorage.setItem('news_list_v1', JSON.stringify(filtered));
                    setNews(filtered);
                }
                return true;
            }
        } catch (err: any) {
            console.error('Error deleting news:', err);
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const saveNewsBulk = useCallback(async (items: News[]): Promise<News[] | null> => {
        setIsLoading(true);
        setError(null);
        try {
            if (session) {
                const payload = items.map(i => {
                    const { id, ...rest } = i;
                    return { ...rest, user_id: session.user.id };
                });
                const { data, error: sbError } = await supabase.from('news').insert(payload).select();
                if (sbError) throw sbError;
                setNews(prev => [...prev, ...data]);
                return data;
            } else {
                const current = localStorage.getItem('news_list_v1');
                const newsList: News[] = current ? JSON.parse(current) : [];
                const newItems = items.map(i => ({ ...i, id: crypto.randomUUID() }));
                const merged = [...newsList, ...newItems];
                localStorage.setItem('news_list_v1', JSON.stringify(merged));
                setNews(merged);
                return newItems;
            }
        } catch (err: any) {
            console.error('Error bulk saving news:', err);
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const overrideNews = useCallback((newList: News[]) => {
        if (!session) {
            localStorage.setItem('news_list_v1', JSON.stringify(newList));
        }
        setNews(newList);
    }, [session]);

    return { news, fetchNews, saveNews, deleteNews, saveNewsBulk, overrideNews, isLoading, error };
}
