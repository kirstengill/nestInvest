import { supabase } from "../../lib/supabaseClient";

const formatCurrency = (value, currency = "USD") => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
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
    const recentlyActiveSince = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const [usersRes, walletsRes, investmentsRes, depositsRes, withdrawalsRes, activeUsersRes] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("wallets").select("balance"),
        supabase.from("investments").select("amount"),
        supabase.from("transactions").select("amount").eq("type", "deposit"),
        supabase.from("transactions").select("amount").eq("type", "withdrawal"),
        supabase.from("user_activity").select("user_id", { count: "exact", head: true }).gte("last_active", recentlyActiveSince),
      ]);

    const totalUsers = usersRes.count || 0;
    const totalBalance = walletsRes.data?.reduce((sum, w) => sum + (Number(w.balance) || 0), 0) || 0;
    const totalInvestments = investmentsRes.data?.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) || 0;
    const totalDeposits = depositsRes.data?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;
    const totalWithdrawals = withdrawalsRes.data?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;

    return {
      totalUsers,
      activeUsers: activeUsersRes.count || 0,
      totalInvestments,
      totalDeposits,
      totalWithdrawals,
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
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, phone, is_admin, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    const { data: wallets } = await supabase
      .from("wallets")
      .select("user_id, balance, currency");

    const { data: investments } = await supabase
      .from("investments")
      .select("user_id, amount, status");

    const { data: activities } = await supabase
      .from("user_activity")
      .select("user_id, last_active");

    const walletMap = new Map(wallets?.map(w => [w.user_id, w]) || []);
    const investmentMap = new Map();
    investments?.forEach(inv => {
      if (!investmentMap.has(inv.user_id)) {
        investmentMap.set(inv.user_id, { count: 0, total: 0 });
      }
      const entry = investmentMap.get(inv.user_id);
      entry.count += 1;
      entry.total += Number(inv.amount) || 0;
    });
    const activityMap = new Map(activities?.map(a => [a.user_id, a.last_active]) || []);

    return (profiles || []).map(p => {
      const wallet = walletMap.get(p.id);
      const inv = investmentMap.get(p.id);
      return {
        id: p.id,
        display_name: p.display_name || "Unnamed",
        email: p.id,
        phone: p.phone || "",
        is_admin: p.is_admin || false,
        balance: wallet?.balance || 0,
        currency: wallet?.currency || "USD",
        investment_count: inv?.count || 0,
        investment_total: inv?.total || 0,
        last_active: activityMap.get(p.id),
        created_at: p.created_at,
      };
    });
  } catch (error) {
    console.warn("Could not fetch users:", error.message);
    return [];
  }
};

export const fetchActiveUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("user_activity")
      .select("user_id, last_active, created_at")
      .order("last_active", { ascending: false })
      .limit(50);

    if (error) throw error;

    const userIds = data?.map(a => a.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, phone")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return (data || []).map(a => ({
      user_id: a.user_id,
      display_name: profileMap.get(a.user_id)?.display_name || "Unknown",
      last_active: a.last_active,
      created_at: a.created_at,
    }));
  } catch (error) {
    console.warn("Could not fetch active users:", error.message);
    return [];
  }
};

export const fetchUserDetails = async (userId) => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: investments } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: activity } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", userId)
      .single();

    return {
      profile,
      wallet,
      investments,
      transactions,
      activity,
    };
  } catch (error) {
    console.warn("Could not fetch user details:", error.message);
    return null;
  }
};

export const fetchInvestmentProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("investment_products")
      .select("*")
      .order("created_at", { ascending: false });

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
      .single();

    if (error && error.code !== "PGRST205") throw error;
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
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const adminIds = [...new Set(data?.map(a => a.admin_id) || [])];
    const userIds = [...new Set(data?.map(a => a.user_id) || [])];
    const allIds = [...new Set([...adminIds, ...userIds])];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", allIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return (data || []).map(a => ({
      ...a,
      admin_name: profileMap.get(a.admin_id)?.display_name || "Unknown Admin",
      user_name: profileMap.get(a.user_id)?.display_name || "Unknown User",
    }));
  } catch (error) {
    console.warn("Could not fetch admin adjustments:", error.message);
    return [];
  }
};

export { formatCurrency, formatDate };
