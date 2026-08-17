import { supabase } from "../../lib/supabaseClient";

const metalNames = ["gold", "silver", "platinum", "palladium", "precious metal"];

const hasMetalCategory = (product) => {
  const searchable = [product.category, product.asset_type, product.name, product.title, product.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return metalNames.some((metal) => searchable.includes(metal));
};

const METAL_IMAGE_THEME = {
  gold: { primary: "#bf953f", secondary: "#fcf6ba", accent: "#8a6e2f", label: "Au" },
  silver: { primary: "#c0c0c0", secondary: "#f5f5f5", accent: "#7a7a7a", label: "Ag" },
  platinum: { primary: "#e5e4e2", secondary: "#ffffff", accent: "#9aa0a6", label: "Pt" },
  palladium: { primary: "#cedbdd", secondary: "#ffffff", accent: "#6a7f82", label: "Pd" },
};

export const buildMetalImage = (category, type) => {
  const theme = METAL_IMAGE_THEME[category] || METAL_IMAGE_THEME.gold;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${theme.secondary}"/>
        <stop offset="0.5" stop-color="${theme.primary}"/>
        <stop offset="1" stop-color="${theme.accent}"/>
      </linearGradient>
      <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="0.4" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.15"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="#101729"/>
    <rect x="60" y="90" width="280" height="320" rx="24" fill="url(#g)"/>
    <rect x="60" y="90" width="280" height="320" rx="24" fill="url(#shine)"/>
    <rect x="60" y="90" width="280" height="6" rx="3" fill="${theme.secondary}" opacity="0.7"/>
    <text x="200" y="270" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="${theme.accent}" text-anchor="middle" opacity="0.25">${theme.label}</text>
    <text x="200" y="330" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="#101729" text-anchor="middle" letter-spacing="1">${type || "METAL"}</text>
    <text x="200" y="365" font-family="Arial, sans-serif" font-size="16" fill="#101729" text-anchor="middle" opacity="0.8">INVESTMENT GRADE</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const DEFAULT_PRODUCTS = [
  { id: "default-gold-1", name: "Gold Bullion", type: "Bullion", category: "gold", return_rate: "12.5%", minimum: 500000, duration: "12 months", description: "Pure 24K gold bullion investment.", image: buildMetalImage("gold", "BULLION"), active: true },
  { id: "default-gold-2", name: "Gold Coins", type: "Coins", category: "gold", return_rate: "11.8%", minimum: 250000, duration: "9 months", description: "Investment-grade gold coins.", image: buildMetalImage("gold", "COINS"), active: true },
  { id: "default-gold-3", name: "Gold Bars", type: "Bars", category: "gold", return_rate: "13.0%", minimum: 1000000, duration: "18 months", description: "Certified gold bars for long-term investment.", image: buildMetalImage("gold", "BARS"), active: true },
  { id: "default-silver-1", name: "Silver Coins", type: "Coins", category: "silver", return_rate: "10.2%", minimum: 200000, duration: "6 months", description: "Pure silver coin investments.", image: buildMetalImage("silver", "COINS"), active: true },
  { id: "default-silver-2", name: "Silver Bars", type: "Bars", category: "silver", return_rate: "9.8%", minimum: 300000, duration: "8 months", description: "Investment-grade silver bars.", image: buildMetalImage("silver", "BARS"), active: true },
  { id: "default-silver-3", name: "Silver Nuggets", type: "Nuggets", category: "silver", return_rate: "11.0%", minimum: 150000, duration: "5 months", description: "Raw silver nugget investments.", image: buildMetalImage("silver", "NUGGETS"), active: true },
  { id: "default-platinum-1", name: "Platinum Bars", type: "Bars", category: "platinum", return_rate: "14.2%", minimum: 800000, duration: "15 months", description: "High-grade platinum bars.", image: buildMetalImage("platinum", "BARS"), active: true },
  { id: "default-platinum-2", name: "Platinum Coins", type: "Coins", category: "platinum", return_rate: "13.5%", minimum: 600000, duration: "12 months", description: "Investment platinum coin collection.", image: buildMetalImage("platinum", "COINS"), active: true },
  { id: "default-platinum-3", name: "Platinum Ingots", type: "Ingots", category: "platinum", return_rate: "15.0%", minimum: 1200000, duration: "24 months", description: "Certified platinum ingots.", image: buildMetalImage("platinum", "INGOTS"), active: true },
  { id: "default-palladium-1", name: "Palladium Bars", type: "Bars", category: "palladium", return_rate: "15.8%", minimum: 700000, duration: "14 months", description: "Premium palladium bars.", image: buildMetalImage("palladium", "BARS"), active: true },
  { id: "default-palladium-2", name: "Palladium Coins", type: "Coins", category: "palladium", return_rate: "14.9%", minimum: 500000, duration: "10 months", description: "Rare palladium coin investments.", image: buildMetalImage("palladium", "COINS"), active: true },
  { id: "default-palladium-3", name: "Palladium Sheets", type: "Sheets", category: "palladium", return_rate: "16.5%", minimum: 900000, duration: "18 months", description: "Industrial-grade palladium sheets.", image: buildMetalImage("palladium", "SHEETS"), active: true },
];

export const fetchPreciousMetalProducts = async () => {
  const { data, error } = await supabase.from("investment_products").select("*");

  if (error && ["42P01", "PGRST205"].includes(error.code)) return DEFAULT_PRODUCTS;
  if (error) throw error;

  const dbProducts = (data || []).filter(hasMetalCategory);
  return dbProducts.length > 0 ? dbProducts : DEFAULT_PRODUCTS;
};
