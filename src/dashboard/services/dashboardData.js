import { supabase } from "../../lib/supabaseClient";

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "UGX",
  }).format(num);
};

const formatPercent = (value) => {
  const num = Number(value) || 0;
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, phone, wallet_balance, created_at")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn("Could not fetch user profile:", error.message);
    return null;
  }
};

/**
 * Fetch user's wallet balance from profiles table
 * This is the primary wallet balance source
 */
export const fetchBalance = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    if (error) throw error;
    
    return {
      balance: Number(data.wallet_balance) || 0,
      currency: "UGX",
    };
  } catch (error) {
    console.warn("Could not fetch balance:", error.message);
    return {
      balance: 0,
      currency: "UGX",
    };
  }
};

export const fetchPerformanceHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("balance_history")
      .select("date, balance")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .limit(30);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn("Could not fetch performance history:", error.message);
    return [];
  }
};

export const fetchInvestments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn("Could not fetch investments:", error.message);
    return [];
  }
};

export const fetchTransactions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn("Could not fetch transactions:", error.message);
    return [];
  }
};

export const fetchNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("read", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn("Could not fetch notifications:", error.message);
    return [];
  }
};

export const calculateTotalReturns = (investments) => {
  if (!investments || investments.length === 0) return 0;
  return investments.reduce((acc, inv) => acc + (Number(inv.returns) || 0), 0);
};

export const calculateTotalInvested = (investments) => {
  if (!investments || investments.length === 0) return 0;
  return investments.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
};

export { formatCurrency, formatPercent, getGreeting };
