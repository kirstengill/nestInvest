CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  is_admin BOOLEAN,
  balance NUMERIC,
  currency TEXT,
  created_at TIMESTAMPTZ,
  active BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    COALESCE(
      p.display_name,
      u.raw_user_meta_data ->> 'display_name',
      split_part(u.email, '@', 1),
      'User'
    ) AS display_name,
    u.email,
    COALESCE(p.phone, u.raw_user_meta_data ->> 'phone') AS phone,
    COALESCE(p.is_admin, false) AS is_admin,
    COALESCE(w.balance, 0) AS balance,
    COALESCE(w.currency, 'USD') AS currency,
    COALESCE(p.created_at, u.created_at) AS created_at,
    CASE
      WHEN ua.last_active IS NOT NULL AND ua.last_active > NOW() - INTERVAL '10 minutes' THEN TRUE
      ELSE FALSE
    END AS active
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.wallets w ON w.user_id = u.id
  LEFT JOIN public.user_activity ua ON ua.user_id = u.id
  ORDER BY COALESCE(p.created_at, u.created_at) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_adjust_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF p_type NOT IN ('credit', 'debit') THEN
    RAISE EXCEPTION 'Invalid type. Use credit or debit';
  END IF;

  SELECT balance INTO v_previous_balance FROM public.wallets WHERE user_id = p_user_id;
  IF v_previous_balance IS NULL THEN
    RAISE EXCEPTION 'User wallet not found';
  END IF;

  IF p_type = 'credit' THEN
    v_new_balance := v_previous_balance + p_amount;
  ELSE
    v_new_balance := v_previous_balance - p_amount;
    IF v_new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient balance for debit';
    END IF;
  END IF;

  UPDATE public.wallets
  SET balance = v_new_balance,
      updated_at = NOW()
  WHERE user_id = p_user_id;

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
    p_amount,
    p_type,
    COALESCE(p_reason, 'Admin balance adjustment'),
    v_previous_balance,
    v_new_balance
  );

  INSERT INTO public.balance_history (user_id, balance, date, created_at)
  VALUES (p_user_id, v_new_balance, CURRENT_DATE, NOW());

  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    status,
    description,
    created_at
  )
  VALUES (
    p_user_id,
    CASE WHEN p_type = 'credit' THEN 'deposit' ELSE 'withdrawal' END,
    p_amount,
    'completed',
    COALESCE(p_reason, 'Admin balance adjustment'),
    NOW()
  );

  INSERT INTO public.notifications (
    user_id,
    message,
    read,
    created_at
  )
  VALUES (
    p_user_id,
    'Your balance was updated by an administrator. New balance: ' || v_new_balance,
    false,
    NOW()
  );

  RETURN json_build_object(
    'success', TRUE,
    'new_balance', v_new_balance,
    'previous_balance', v_previous_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_adjust_balance(UUID, NUMERIC, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_balance(UUID, NUMERIC, TEXT, TEXT) TO authenticated;
