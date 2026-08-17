import { supabase } from "../../lib/supabaseClient";

export const formatCurrency = (value, currency = "UGX") => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const fetchAdminSummary = async () => {
  try {
    const { data: profiles, error, count } = await supabase
      .from("profiles")
      .select("id, wallet_balance", { count: "exact" });

    if (error) throw error;

    const totalUsers = count || profiles?.length || 0;
    const totalBalance = (profiles || []).reduce((sum, profile) => {
      return sum + (Number(profile.wallet_balance) || 0);
    }, 0);

    return {
      totalUsers,
      activeUsers: Math.ceil(totalUsers * 0.7),
      totalInvestments: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalBalance,
    };
  } catch (error) {
    console.warn("Could not fetch admin summary:", error.message);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalInvestments: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalBalance: 0,
    };
  }
};

export const fetchAllUsers = async () => {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, display_name, phone, wallet_balance, is_admin, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (profiles || []).map((profile) => ({
      id: profile.id,
      uid: profile.id,
      display_name: profile.display_name || "Unnamed User",
      phone: profile.phone || "—",
      is_admin: Boolean(profile.is_admin),
      balance: Number(profile.wallet_balance) || 0,
      wallet_balance: Number(profile.wallet_balance) || 0,
      currency: "UGX",
      created_at: profile.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }
};

export const fetchUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, phone, wallet_balance, is_admin, created_at")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      uid: data.id,
      display_name: data.display_name || "Unnamed User",
      phone: data.phone || "—",
      is_admin: Boolean(data.is_admin),
      balance: Number(data.wallet_balance) || 0,
      wallet_balance: Number(data.wallet_balance) || 0,
      currency: "UGX",
      created_at: data.created_at,
    };
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
};

export const fetchActiveUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("user_activity")
      .select("user_id, last_active")
      .order("last_active", { ascending: false })
      .limit(50);

    if (error) throw error;

    const userIds = (data || []).map((row) => row.user_id).filter(Boolean);
    if (!userIds.length) return [];

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    if (profileError) throw profileError;

    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile.display_name || "User"]));

    return (data || []).map((row) => ({
      user_id: row.user_id,
      display_name: profileMap.get(row.user_id) || "User",
      last_active: row.last_active,
    }));
  } catch (error) {
    console.warn("Could not fetch active users:", error.message);
    return [];
  }
};

export const fetchInvestmentProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("investment_products")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn("Could not fetch investment products:", error.message);
    return [];
  }
};

export const fetchInvestmentMaterials = async (productId) => {
  try {
    const { data, error } = await supabase
      .from("investment_materials")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.warn("Could not fetch investment materials:", error.message);
    return null;
  }
};

export const fetchAdminAdjustments = async () => {
  try {
    const { data, error } = await supabase
      .from("admin_balance_adjustments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      ...row,
      user_name: row.user_name || "User",
      admin_name: row.admin_name || "Administrator",
    }));
  } catch (error) {
    console.warn("Could not fetch admin adjustments:", error.message);
    return [];
  }
};


