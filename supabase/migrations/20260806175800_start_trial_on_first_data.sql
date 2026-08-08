-- Add trial_started_at column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_started_at timestamp with time zone;

-- Create function to trigger free trial countdown ONLY on first data input (trades or accounts)
CREATE OR REPLACE FUNCTION public.start_trial_on_first_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  user_profile RECORD;
  plan_rec RECORD;
  calc_duration INTERVAL;
BEGIN
  target_user_id := NEW.user_id;
  IF target_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO user_profile FROM public.profiles WHERE id = target_user_id;
  
  -- If user is on free plan and has not yet started their trial countdown
  IF user_profile IS NOT NULL AND LOWER(COALESCE(user_profile.plan, 'free')) = 'free' AND user_profile.trial_started_at IS NULL THEN
    SELECT * INTO plan_rec FROM public.plans_config WHERE id = 'free';
    
    IF plan_rec IS NOT NULL AND COALESCE(plan_rec.trial_duration_value, plan_rec.trial_days, 0) > 0 THEN
      IF plan_rec.trial_duration_unit = 'minutes' THEN
        calc_duration := (COALESCE(plan_rec.trial_duration_value, 30) || ' minutes')::interval;
      ELSIF plan_rec.trial_duration_unit = 'hours' THEN
        calc_duration := (COALESCE(plan_rec.trial_duration_value, 30) || ' hours')::interval;
      ELSIF plan_rec.trial_duration_unit = 'months' THEN
        calc_duration := (COALESCE(plan_rec.trial_duration_value, 30) || ' months')::interval;
      ELSIF plan_rec.trial_duration_unit = 'years' THEN
        calc_duration := (COALESCE(plan_rec.trial_duration_value, 30) || ' years')::interval;
      ELSE
        calc_duration := (COALESCE(plan_rec.trial_duration_value, plan_rec.trial_days, 30) || ' days')::interval;
      END IF;
    ELSE
      calc_duration := INTERVAL '30 days';
    END IF;

    UPDATE public.profiles
    SET trial_started_at = NOW(),
        trial_end = NOW() + calc_duration,
        updated_at = NOW()
    WHERE id = target_user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on trades insertion
DROP TRIGGER IF EXISTS trigger_start_trial_trades ON public.trades;
CREATE TRIGGER trigger_start_trial_trades
AFTER INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.start_trial_on_first_data();

-- Trigger on accounts insertion
DROP TRIGGER IF EXISTS trigger_start_trial_accounts ON public.accounts;
CREATE TRIGGER trigger_start_trial_accounts
AFTER INSERT ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.start_trial_on_first_data();
