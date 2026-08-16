-- Secure follow-up for the admin platform. Apply after the initial schema migration.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$;

-- Avoid recursive profile policies and prevent users from granting themselves admin access.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can update own profile details" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, phone) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
CREATE POLICY "Admins can view all wallets" ON public.wallets FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can view all investments" ON public.investments;
CREATE POLICY "Admins can view all investments" ON public.investments FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can view all activity" ON public.user_activity;
CREATE POLICY "Admins can view all activity" ON public.user_activity FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can view all adjustments" ON public.admin_balance_adjustments;
DROP POLICY IF EXISTS "Admins can insert adjustments" ON public.admin_balance_adjustments;
CREATE POLICY "Admins can view all adjustments" ON public.admin_balance_adjustments FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert adjustments" ON public.admin_balance_adjustments FOR INSERT WITH CHECK (public.is_admin());

-- Create the related records at signup, using only authenticated metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''), NEW.raw_user_meta_data ->> 'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_activity (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id UUID, p_is_admin BOOLEAN)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin access required'; END IF;
  UPDATE public.profiles SET is_admin = p_is_admin WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'User profile not found'; END IF;
  RETURN json_build_object('success', TRUE);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_investment(
  p_id TEXT, p_name TEXT, p_type TEXT, p_category TEXT, p_return_rate TEXT,
  p_description TEXT, p_image TEXT, p_minimum NUMERIC, p_duration TEXT, p_active BOOLEAN
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin access required'; END IF;
  IF p_id IS NULL OR p_id !~ '^[a-z0-9-]+$' THEN RAISE EXCEPTION 'Use a lowercase product ID with letters, numbers, and hyphens only'; END IF;
  IF p_minimum IS NULL OR p_minimum <= 0 THEN RAISE EXCEPTION 'Minimum investment must be positive'; END IF;
  INSERT INTO public.investment_products (id, name, type, category, return_rate, description, image, minimum, duration, active)
  VALUES (p_id, p_name, p_type, p_category, p_return_rate, p_description, p_image, p_minimum, p_duration, COALESCE(p_active, TRUE));
  RETURN json_build_object('success', TRUE);
END;
$$;
