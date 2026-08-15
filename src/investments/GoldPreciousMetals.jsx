import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import "./goldPreciousMetals.css";

// Centralised catalog configuration for this category. Update these values when
// the product catalog is connected to a managed investment-products backend.
const METAL_SERIES = [
  { id: "gold", type: "24K Pure Gold", return: "10% p.a.", description: "A time-tested store of value.", image: "https://i.pinimg.com/originals/8e/c3/31/8ec331d21f9ce812bb0acf8411683ef6.jpg", amounts: [20000, 25000, 35000, 45000, 60000, 80000], durations: ["6 months", "9 months", "12 months", "15 months", "18 months", "24 months"], names: ["Gold Starter", "Gold Secure", "Gold Growth", "Gold Horizon", "Gold Legacy", "Gold Reserve"] },
  { id: "silver", type: "Pure Silver", return: "8% p.a.", description: "Accessible metal exposure.", image: "https://www.images-apmex.com/images/products/1-kilo-silver-bar-999-fine_10255_Av.jpg", amounts: [10000, 15000, 22000, 30000, 40000, 55000], durations: ["3 months", "6 months", "9 months", "12 months", "15 months", "18 months"], names: ["Silver Entry", "Silver Select", "Silver Momentum", "Silver Builder", "Silver Crest", "Silver Vault"] },
  { id: "platinum", type: "Pure Platinum", return: "12% p.a.", description: "A scarce, high-value metal.", image: "https://goldsecure.com.au/wp-content/uploads/2024/03/1-OZT-Platinumm-Minted-Bar-999.png", amounts: [50000, 65000, 85000, 100000, 130000, 175000], durations: ["6 months", "9 months", "12 months", "15 months", "18 months", "24 months"], names: ["Platinum Access", "Platinum Prime", "Platinum Select", "Platinum Advance", "Platinum Signature", "Platinum Estate"] },
  { id: "palladium", type: "Investment-grade Palladium", return: "11% p.a.", description: "Diversified industrial-metal exposure.", image: "https://www.sbcgold.com/wp-content/uploads/2023/01/10-gram-palladium-investment.jpg", amounts: [30000, 40000, 55000, 75000, 95000, 120000], durations: ["6 months", "9 months", "12 months", "15 months", "18 months", "24 months"], names: ["Palladium Core", "Palladium Select", "Palladium Growth", "Palladium Vertex", "Palladium Strategic", "Palladium Elite"] },
];

const METAL_PRODUCTS = METAL_SERIES.flatMap((metal) => metal.amounts.map((minimum, index) => ({
  ...metal,
  id: `${metal.id}-${index + 1}`,
  name: metal.names[index],
  minimum,
  duration: metal.durations[index],
})));

const formatUGX = (amount) => new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(amount);

const GoldPreciousMetals = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [checkingId, setCheckingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const filteredProducts = filter === "All" ? METAL_PRODUCTS : METAL_PRODUCTS.filter((product) => product.id.startsWith(filter.toLowerCase()));
  const visibleProducts = showAll || filter !== "All" ? filteredProducts : filteredProducts.slice(0, 8);
  const filters = ["All", "Gold", "Silver", "Platinum", "Palladium"];

  const handleInvest = async (product) => {
    if (!session?.user?.id) { navigate("/signin"); return; }
    setCheckingId(product.id);
    setNotice(null);
    const { data: wallet, error } = await supabase.from("wallets").select("balance, currency").eq("user_id", session.user.id).single();
    setCheckingId(null);
    if (error || !wallet) { setNotice({ type: "error", text: "We couldn’t verify your available balance. Please try again." }); return; }
    if (Number(wallet.balance) < product.minimum) { setNotice({ type: "insufficient", text: "Insufficient balance. Please deposit funds to continue." }); return; }
    setNotice({ type: "ready", text: "Your balance is sufficient. Investment confirmation is unavailable until the existing secure investment workflow is connected." });
  };

  return (
    <main className="metals-page">
      <div className="metals-page__container">
        <header className="metals-page__header">
          <Link className="metals-page__back" to="/dashboard" aria-label="Back to dashboard"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>Dashboard</Link>
          <div className="metals-page__heading"><span className="metals-page__heading-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 9-5 9 5-9 5-9-5Z" /><path d="m3 16 9 5 9-5" /><path d="m3 12 9 5 9-5" /></svg></span><div><h1>Gold &amp; Precious Metals</h1><p>Invest in timeless value and security.</p></div></div>
        </header>
        <section className="metals-page__featured" aria-labelledby="metals-featured-title"><div className="metals-page__featured-copy"><span className="metals-page__eyebrow">PRECIOUS METALS</span><h2 id="metals-featured-title">A resilient asset class for long-term portfolios.</h2><p>Explore metal investment options designed for considered, long-term participation.</p></div><div className="metals-page__featured-mark" aria-hidden="true"><span>Au</span><small>79</small></div></section>
        <section className="metals-page__catalog" aria-labelledby="metals-catalog-title">
          <div className="metals-page__catalog-header"><div><h2 id="metals-catalog-title">Available investments</h2><p>Choose an asset aligned with your investment goals.</p></div><div className="metals-page__filters" aria-label="Filter precious-metal products">{filters.map((item) => <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => { setFilter(item); setShowAll(false); }}>{item}</button>)}</div></div>
          {notice && <div className={`metals-page__notice metals-page__notice--${notice.type}`} role="status"><span>{notice.text}</span>{notice.type === "insufficient" && <button type="button" onClick={() => navigate("/dashboard")}>Deposit Funds</button>}</div>}
          <div className="metals-page__grid">{visibleProducts.map((product) => <article className="metal-product-card" key={product.id}><div className="metal-product-card__image"><img src={product.image} alt={`${product.name} bullion`} /><span>Open</span></div><div className="metal-product-card__body"><div><p className="metal-product-card__type">{product.type}</p><h3>{product.name}</h3></div><div className="metal-product-card__facts"><span><small>Minimum</small>{formatUGX(product.minimum)}</span><span><small>Return</small>{product.return}</span><span><small>Term</small>{product.duration}</span></div><button type="button" onClick={() => handleInvest(product)} disabled={checkingId === product.id}>{checkingId === product.id ? "Checking…" : "Invest"}</button></div></article>)}</div>
          {filter === "All" && filteredProducts.length > 8 && <div className="metals-page__more"><button type="button" onClick={() => setShowAll((current) => !current)}>{showAll ? "Show Less" : `See More (${filteredProducts.length - 8} more)`}</button></div>}
        </section>
      </div>
    </main>
  );
};

export default GoldPreciousMetals;
