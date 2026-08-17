import { supabase } from "../../lib/supabaseClient";

/**
 * Set a user's wallet balance directly to a specific amount
 * This is the primary function used by the admin dashboard
 */
export const adminSetWalletBalance = async (userId, newBalance, reason = null) => {
  try {
    if (!Number.isFinite(newBalance) || newBalance < 0) {
      throw new Error("Wallet balance must be a non-negative number");
    }

    const { data, error } = await supabase.rpc("admin_set_wallet_balance", {
      p_user_id: userId,
      p_new_balance: newBalance,
      p_reason: reason || "Admin balance adjustment",
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error setting wallet balance:", error.message);
    throw error;
  }
};

/**
 * Adjust balance by a delta amount (for credit/debit operations)
 * Legacy function - kept for backward compatibility
 */
export const adminAdjustBalance = async (userId, amount, type, reason) => {
  try {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Amount must be a non-negative number");
    }

    if (!["credit", "debit"].includes(type)) {
      throw new Error("Type must be 'credit' or 'debit'");
    }

    // Fetch current balance
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      throw new Error("User profile not found");
    }

    const currentBalance = Number(profile.wallet_balance) || 0;
    let newBalance = currentBalance;

    if (type === "credit") {
      newBalance = currentBalance + amount;
    } else if (type === "debit") {
      newBalance = currentBalance - amount;
      if (newBalance < 0) {
        throw new Error("Insufficient balance for debit operation");
      }
    }

    // Use the new function to set the balance
    return await adminSetWalletBalance(userId, newBalance, reason);
  } catch (error) {
    console.error("Error adjusting balance:", error.message);
    throw error;
  }
};

export const adminCreateInvestment = async (fields) => {
  const { data, error } = await supabase
    .from("investment_products")
    .insert(fields)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const adminUpdateInvestment = async (id, fields) => {
  const { error } = await supabase
    .from("investment_products")
    .update(fields)
    .eq("id", id);

  if (error) throw error;
  return { success: true };
};

export const adminSetUserRole = async (userId, isAdmin) => {
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) throw error;
  return { success: true };
};

export const adminDeleteInvestment = async (id) => {
  const { error } = await supabase
    .from("investment_products")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
};

export const adminUpsertMaterials = async (productId, materials) => {
  const { data, error } = await supabase.rpc("admin_upsert_materials", {
    p_product_id: productId,
    p_description: materials?.description ?? null,
    p_information: materials?.information ?? null,
    p_educational_content: materials?.educational_content ?? null,
    p_comments: materials?.comments ?? null,
    p_important_info: materials?.important_info ?? null,
  });

  if (error) throw error;
  return data;
};

export const uploadImage = async (file, path) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${path}-${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("investment-images")
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from("investment-images")
    .getPublicUrl(fileName);

  return publicUrl;
};
