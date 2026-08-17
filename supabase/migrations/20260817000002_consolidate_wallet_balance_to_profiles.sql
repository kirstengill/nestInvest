-- Consolidate wallet_balance into profiles table
-- This migration adds wallet_balance to profiles and migrates data from wallets table

-- Step 1: Add wallet_balance column to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;

-- Step 2: Migrate existing wallet balances to profiles
UPDATE public.profiles p
SET wallet_balance = COALESCE(w.balance, 0)
FROM public.wallets w
WHERE p.id = w.user_id;

-- Step 3: Set all wallet_balances to 0 if NULL (shouldn't happen, but be safe)
UPDATE public.profiles
SET wallet_balance = 0
WHERE wallet_balance IS NULL;

-- Step 4: Update the trigger to create profile with wallet_balance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, wallet_balance)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''), NEW.raw_user_meta_data ->> 'phone', 0)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_activity (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Step 5: Create a secure function for admins to update wallet balance directly on profiles
CREATE OR REPLACE FUNCTION public.admin_set_wallet_balance(
  p_user_id UUID,
  p_new_balance NUMERIC,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous_balance NUMERIC;
BEGIN
  -- Check admin authorization
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  -- Validate input
  IF p_new_balance < 0 THEN
    RAISE EXCEPTION 'Wallet balance cannot be negative';
  END IF;

  -- Get current balance for audit log
  SELECT wallet_balance INTO v_previous_balance FROM public.profiles WHERE id = p_user_id;
  IF v_previous_balance IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Update wallet balance
  UPDATE public.profiles
  SET wallet_balance = p_new_balance
  WHERE id = p_user_id;

  -- Insert audit log
  INSERT INTO public.admin_balance_adjustments (
    admin_id,
    user_id,
    amount,
    type,
    reason,
    previous_balance,
    new_balance
  )
  VALUES (
    auth.uid(),
    p_user_id,
    ABS(p_new_balance - v_previous_balance),
    CASE WHEN p_new_balance > v_previous_balance THEN 'credit' ELSE 'debit' END,
    COALESCE(p_reason, 'Direct balance adjustment'),
    v_previous_balance,
    p_new_balance
  );

  RETURN json_build_object(
    'success', TRUE,
    'previous_balance', v_previous_balance,
    'new_balance', p_new_balance
  );
END;
$$;

-- Step 6: Update RLS policies for profiles to allow admin access to wallet_balance
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Step 7: Create helper function to get user profile with all info
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  phone TEXT,
  wallet_balance NUMERIC,
  is_admin BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    display_name,
    phone,
    wallet_balance,
    is_admin,
    created_at
  FROM public.profiles
  WHERE id = p_user_id;
$$;

-- Grant execute permission on helper functions
GRANT EXECUTE ON FUNCTION public.admin_set_wallet_balance(UUID, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
