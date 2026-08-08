-- Fix secure_profile_fields trigger function to avoid referencing non-existent next_bill_date,
-- correctly allow initial user onboarding / free trial selection,
-- strictly prevent expired users from re-activating or renewing free trials,
-- and prevent non-admin privilege escalation.

CREATE OR REPLACE FUNCTION public.secure_profile_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only validate if the user is updating their own row directly via the client API (authenticated user)
  -- Service role / Admin Edge Functions bypass this check
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id AND (COALESCE(auth.jwt() ->> 'role', '') != 'service_role') THEN
    -- Check if user is trying to elevate role to admin
    IF NEW.role IS DISTINCT FROM OLD.role AND NEW.role = 'admin' AND COALESCE(OLD.role, '') != 'admin' THEN
      RAISE EXCEPTION 'Unauthorized attempt to modify role. Action blocked.';
    END IF;

    -- Prevent renewing / extending free trial if OLD.trial_end was already expired and user is not admin override
    IF OLD.trial_end IS NOT NULL AND OLD.trial_end < NOW() AND NEW.trial_end > OLD.trial_end AND (NEW.is_admin_override IS NOT TRUE AND COALESCE(OLD.is_admin_override, FALSE) IS NOT TRUE) THEN
      RAISE EXCEPTION 'Free trial has already expired. Please choose a paid plan to continue.';
    END IF;

    -- Check if user is trying to set a paid plan directly without stripe
    IF NEW.plan IS DISTINCT FROM OLD.plan AND NEW.plan IN ('pro', 'premium', 'lifetime') AND (OLD.plan IS NULL OR OLD.plan NOT IN ('pro', 'premium', 'lifetime')) THEN
      -- Only allow if stripe_subscription_id is already present or if admin override
      IF NEW.stripe_subscription_id IS NULL AND OLD.stripe_subscription_id IS NULL AND (NEW.is_admin_override IS NOT TRUE) THEN
        RAISE EXCEPTION 'Unauthorized attempt to assign paid plan without checkout. Action blocked.';
      END IF;
    END IF;

    -- Check if user is trying to forge admin overrides
    IF (NEW.is_admin_override IS DISTINCT FROM OLD.is_admin_override AND NEW.is_admin_override = TRUE) OR
       (NEW.admin_override_plan IS DISTINCT FROM OLD.admin_override_plan AND NEW.admin_override_plan IS NOT NULL) THEN
      RAISE EXCEPTION 'Unauthorized attempt to modify admin overrides. Action blocked.';
    END IF;

    -- Check if user is trying to modify existing stripe identifiers directly
    IF (NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id AND OLD.stripe_customer_id IS NOT NULL) OR
       (NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id AND OLD.stripe_subscription_id IS NOT NULL) THEN
      RAISE EXCEPTION 'Unauthorized attempt to modify billing identifiers. Action blocked.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
