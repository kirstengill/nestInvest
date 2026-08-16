import { supabase } from "../../lib/supabaseClient";

export const adminAdjustBalance = async (userId, amount, type, reason) => {
  const { data, error } = await supabase.rpc("admin_adjust_balance", {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_reason: reason,
  });

  if (error) throw error;
  return data;
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
  const { data, error } = await supabase.rpc("admin_update_investment", {
    p_id: id,
    p_name: fields.name,
    p_type: fields.type,
    p_category: fields.category,
    p_return_rate: fields.return_rate,
    p_description: fields.description,
    p_image: fields.image,
    p_minimum: fields.minimum,
    p_duration: fields.duration,
    p_active: fields.active,
  });

  if (error) throw error;
  return data;
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
  const { data, error } = await supabase.rpc("admin_delete_investment", {
    p_id: id,
  });

  if (error) throw error;
  return data;
};

export const adminUpsertMaterials = async (productId, materials) => {
  const { data, error } = await supabase.rpc("admin_upsert_materials", {
    p_product_id: productId,
    p_description: materials.description,
    p_information: materials.information,
    p_educational_content: materials.educational_content,
    p_comments: materials.comments,
    p_important_info: materials.important_info,
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
