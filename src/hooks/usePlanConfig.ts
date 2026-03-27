/**
 * usePlanConfig – Fetches plan configuration from the Supabase `plans_config` table.
 * This allows Admin to manage plan names, prices, and features without code changes.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface PlanConfig {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  stripe_price_monthly: string | null;
  stripe_price_yearly: string | null;
  features: string[];
  trial_days: number;
  trial_duration_value: number;
  trial_duration_unit: 'minutes' | 'hours' | 'days' | 'months' | 'years';
  is_active: boolean;
  sort_order: number;
}

export function usePlanConfig() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plans_config')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data as PlanConfig[]);
    } catch (err: any) {
      console.error('Failed to load plan config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getPlan = (id: string) => plans.find(p => p.id === id);
  const getFreePlan = () => getPlan('free');
  const getBasicPlan = () => getPlan('basic');
  const getPremiumPlan = () => getPlan('premium');

  return { plans, loading, error, fetchPlans, getPlan, getFreePlan, getBasicPlan, getPremiumPlan };
}
