import { supabase } from "../../lib/supabaseClient";

const metalNames = ["gold", "silver", "platinum", "palladium", "precious metal"];

const hasMetalCategory = (product) => {
  const searchable = [product.category, product.asset_type, product.name, product.title, product.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return metalNames.some((metal) => searchable.includes(metal));
};

export const fetchPreciousMetalProducts = async () => {
  const { data, error } = await supabase.from("investment_products").select("*");

  // A product catalog is optional in the current application. A missing catalog
  // is handled as an empty category, not substituted with made-up products.
  if (error && ["42P01", "PGRST205"].includes(error.code)) return [];
  if (error) throw error;

  return (data || []).filter(hasMetalCategory);
};
