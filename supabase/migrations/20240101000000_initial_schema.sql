-- ============================================
-- NextInvest Admin Platform
-- Initial Schema Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Profiles (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Wallets
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Balance History
-- ============================================
CREATE TABLE IF NOT EXISTS balance_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Investments
-- ============================================
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES investment_products(id),
  amount NUMERIC NOT NULL,
  returns NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Transactions
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Investment Products (managed by admin)
-- ============================================
CREATE TABLE IF NOT EXISTS investment_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  return_rate TEXT NOT NULL,
  description TEXT,
  image TEXT,
  minimum NUMERIC NOT NULL,
  duration TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- User Activity
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Admin Balance Adjustments (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_balance_adjustments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  reason TEXT NOT NULL,
  previous_balance NUMERIC NOT NULL,
  new_balance NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Investment Materials / Content
-- ============================================
CREATE TABLE IF NOT EXISTS investment_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id TEXT REFERENCES investment_products(id) ON DELETE CASCADE,
  description TEXT,
  information TEXT,
  educational_content TEXT,
  comments TEXT,
  important_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_user_id ON balance_history(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_products_active ON investment_products(active);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_active ON user_activity(last_active);
CREATE INDEX IF NOT EXISTS idx_admin_adjustments_user_id ON admin_balance_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_adjustments_admin_id ON admin_balance_adjustments(admin_id);
CREATE INDEX IF NOT EXISTS idx_investment_materials_product_id ON investment_materials(product_id);

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_balance_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_materials ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Wallets: users can read their own, admins can read all
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets" ON wallets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Balance history: users can read their own, admins can read all
CREATE POLICY "Users can view own balance history" ON balance_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all balance history" ON balance_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Investments: users can read their own, admins can read all
CREATE POLICY "Users can view own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all investments" ON investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Transactions: users can read their own, admins can read all
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Notifications: users can manage their own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Investment products: everyone can read active, admins can manage all
CREATE POLICY "Anyone can view active products" ON investment_products FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can view all products" ON investment_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can insert products" ON investment_products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can update products" ON investment_products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can delete products" ON investment_products FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- User activity: users can update their own, admins can read all
CREATE POLICY "Users can update own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activity on conflict" ON user_activity FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all activity" ON user_activity FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Admin balance adjustments: only admins can insert, admins can read all
CREATE POLICY "Admins can view all adjustments" ON admin_balance_adjustments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can insert adjustments" ON admin_balance_adjustments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Investment materials: everyone can read for active products, admins can manage
CREATE POLICY "Anyone can view materials for active products" ON investment_materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM investment_products WHERE id = investment_materials.product_id AND active = TRUE)
);
CREATE POLICY "Admins can view all materials" ON investment_materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can insert materials" ON investment_materials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can update materials" ON investment_materials FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can delete materials" ON investment_materials FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ============================================
-- RPC Functions for Admin Operations
-- ============================================

-- Admin: Adjust user balance with audit trail
CREATE OR REPLACE FUNCTION admin_adjust_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_previous_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_admin_id := auth.uid();

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF p_type NOT IN ('credit', 'debit') THEN
    RAISE EXCEPTION 'Invalid type. Use credit or debit';
  END IF;

  SELECT balance INTO v_previous_balance FROM wallets WHERE user_id = p_user_id;
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

  UPDATE wallets SET balance = v_new_balance, updated_at = NOW() WHERE user_id = p_user_id;

  INSERT INTO admin_balance_adjustments (admin_id, user_id, amount, type, reason, previous_balance, new_balance)
  VALUES (v_admin_id, p_user_id, p_amount, p_type, p_reason, v_previous_balance, v_new_balance);

  RETURN json_build_object('success', TRUE, 'new_balance', v_new_balance, 'previous_balance', v_previous_balance);
END;
$$;

-- Admin: Update investment product
CREATE OR REPLACE FUNCTION admin_update_investment(
  p_id TEXT,
  p_name TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_return_rate TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_image TEXT DEFAULT NULL,
  p_minimum NUMERIC DEFAULT NULL,
  p_duration TEXT DEFAULT NULL,
  p_active BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_product investment_products%ROWTYPE;
BEGIN
  v_admin_id := auth.uid();

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  SELECT * INTO v_product FROM investment_products WHERE id = p_id;
  IF v_product.id IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  UPDATE investment_products SET
    name = COALESCE(p_name, name),
    type = COALESCE(p_type, type),
    category = COALESCE(p_category, category),
    return_rate = COALESCE(p_return_rate, return_rate),
    description = COALESCE(p_description, description),
    image = COALESCE(p_image, image),
    minimum = COALESCE(p_minimum, minimum),
    duration = COALESCE(p_duration, duration),
    active = COALESCE(p_active, active),
    updated_at = NOW()
  WHERE id = p_id;

  RETURN json_build_object('success', TRUE);
END;
$$;

-- Admin: Delete investment product
CREATE OR REPLACE FUNCTION admin_delete_investment(p_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  DELETE FROM investment_products WHERE id = p_id;

  RETURN json_build_object('success', TRUE);
END;
$$;

-- Admin: Upsert investment materials
CREATE OR REPLACE FUNCTION admin_upsert_materials(
  p_product_id TEXT,
  p_description TEXT DEFAULT NULL,
  p_information TEXT DEFAULT NULL,
  p_educational_content TEXT DEFAULT NULL,
  p_comments TEXT DEFAULT NULL,
  p_important_info TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  INSERT INTO investment_materials (product_id, description, information, educational_content, comments, important_info, updated_at)
  VALUES (p_product_id, p_description, p_information, p_educational_content, p_comments, p_important_info, NOW())
  ON CONFLICT (product_id) DO UPDATE SET
    description = COALESCE(EXCLUDED.description, investment_materials.description),
    information = COALESCE(EXCLUDED.information, investment_materials.information),
    educational_content = COALESCE(EXCLUDED.educational_content, investment_materials.educational_content),
    comments = COALESCE(EXCLUDED.comments, investment_materials.comments),
    important_info = COALESCE(EXCLUDED.important_info, investment_materials.important_info),
    updated_at = NOW();

  RETURN json_build_object('success', TRUE);
END;
$$;

-- ============================================
-- Seed Initial Investment Products
-- ============================================
INSERT INTO investment_products (id, name, type, category, return_rate, description, image, minimum, duration, active)
VALUES
  ('gold', 'Gold Secure', '24K Pure Gold', 'gold', '10% p.a.', 'A time-tested store of value.', 'https://i.pinimg.com/originals/8e/c3/31/8ec331d21f9ce812bb0acf8411683ef6.jpg', 20000, '6 months', TRUE),
  ('silver', 'Silver Select', 'Pure Silver', 'silver', '8% p.a.', 'Accessible metal exposure.', 'https://www.images-apmex.com/images/products/1-kilo-silver-bar-999-fine_10255_Av.jpg', 10000, '6 months', TRUE),
  ('platinum', 'Platinum Prime', 'Pure Platinum', 'platinum', '12% p.a.', 'A scarce, high-value metal.', 'https://goldsecure.com.au/wp-content/uploads/2024/03/1-OZT-Platinumm-Minted-Bar-999.png', 50000, '6 months', TRUE),
  ('palladium', 'Palladium Select', 'Investment-grade Palladium', 'palladium', '11% p.a.', 'Diversified industrial-metal exposure.', 'https://www.sbcgold.com/wp-content/uploads/2023/01/10-gram-palladium-investment.jpg', 30000, '6 months', TRUE)
ON CONFLICT (id) DO NOTHING;
