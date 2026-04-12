import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface TradingFavorite {
  id?: string;
  user_id?: string;
  symbol: string;
  exchange: string;
  name: string;
  type: string;
  color: string;
}

export function useTradingFavoritesRepository(session: any) {
  const [favorites, setFavorites] = useState<TradingFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from Supabase when session is available
  useEffect(() => {
    let isMounted = true;

    async function fetchFavorites() {
      if (!session) {
        // Fall back to localStorage for unauthenticated users
        if (isMounted) {
          try {
            const saved = localStorage.getItem('quantara_trading_favorites');
            setFavorites(saved ? JSON.parse(saved) : []);
          } catch {
            setFavorites([]);
          }
        }
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('trading_favorites')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (isMounted) {
          setFavorites(data || []);
        }
      } catch (err) {
        console.error('Error fetching trading favorites:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFavorites();
    return () => { isMounted = false; };
  }, [session]);

  // Add or update a favorite
  const saveFavorite = async (fav: TradingFavorite) => {
    if (!session) {
      // localStorage fallback
      setFavorites(prev => {
        const exists = prev.findIndex(f => f.symbol === fav.symbol && f.exchange === fav.exchange);
        let next: TradingFavorite[];
        if (exists >= 0) {
          next = [...prev];
          next[exists] = fav;
        } else {
          next = [...prev, fav];
        }
        localStorage.setItem('quantara_trading_favorites', JSON.stringify(next));
        return next;
      });
      return;
    }

    // Optimistic update
    setFavorites(prev => {
      const exists = prev.findIndex(f => f.symbol === fav.symbol && f.exchange === fav.exchange);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = fav;
        return next;
      }
      return [...prev, fav];
    });

    try {
      const { error } = await supabase.from('trading_favorites').upsert({
        user_id: session.user.id,
        symbol: fav.symbol,
        exchange: fav.exchange,
        name: fav.name,
        type: fav.type,
        color: fav.color,
      }, { onConflict: 'user_id,symbol,exchange' });

      if (error) throw error;

      // Refresh to get server-assigned id
      const { data } = await supabase
        .from('trading_favorites')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setFavorites(data);
    } catch (err) {
      console.error('Error saving trading favorite:', err);
    }
  };

  // Delete a favorite by symbol+exchange
  const deleteFavorite = async (symbol: string, exchange: string) => {
    if (!session) {
      setFavorites(prev => {
        const next = prev.filter(f => !(f.symbol === symbol && f.exchange === exchange));
        localStorage.setItem('quantara_trading_favorites', JSON.stringify(next));
        return next;
      });
      return;
    }

    setFavorites(prev => prev.filter(f => !(f.symbol === symbol && f.exchange === exchange)));

    try {
      const { error } = await supabase
        .from('trading_favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('symbol', symbol)
        .eq('exchange', exchange);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting trading favorite:', err);
    }
  };

  // Update (edit) an existing favorite — match by old symbol+exchange then upsert new values
  const updateFavorite = async (oldSymbol: string, oldExchange: string, updated: TradingFavorite) => {
    if (!session) {
      setFavorites(prev => {
        const next = prev.map(f =>
          f.symbol === oldSymbol && f.exchange === oldExchange ? updated : f
        );
        localStorage.setItem('quantara_trading_favorites', JSON.stringify(next));
        return next;
      });
      return;
    }

    setFavorites(prev => prev.map(f =>
      f.symbol === oldSymbol && f.exchange === oldExchange ? updated : f
    ));

    try {
      // If symbol/exchange unchanged, do a simple update
      if (oldSymbol === updated.symbol && oldExchange === updated.exchange) {
        await supabase.from('trading_favorites').update({
          name: updated.name,
          type: updated.type,
          color: updated.color,
        })
          .eq('user_id', session.user.id)
          .eq('symbol', oldSymbol)
          .eq('exchange', oldExchange);
      } else {
        // Delete old, insert new
        await supabase.from('trading_favorites').delete()
          .eq('user_id', session.user.id)
          .eq('symbol', oldSymbol)
          .eq('exchange', oldExchange);

        await supabase.from('trading_favorites').insert({
          user_id: session.user.id,
          symbol: updated.symbol,
          exchange: updated.exchange,
          name: updated.name,
          type: updated.type,
          color: updated.color,
        });
      }

      // Refresh
      const { data } = await supabase
        .from('trading_favorites')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setFavorites(data);
    } catch (err) {
      console.error('Error updating trading favorite:', err);
    }
  };

  return { favorites, saveFavorite, deleteFavorite, updateFavorite, isLoading };
}
