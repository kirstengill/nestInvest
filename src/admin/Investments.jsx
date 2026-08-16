import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { fetchInvestmentProducts } from "./services/adminData";
import { adminCreateInvestment, adminUpdateInvestment, adminDeleteInvestment } from "./services/adminActions";
import "./admin.css";

const InvestmentsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function loadProducts() {
    const data = await fetchInvestmentProducts();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    const initialLoad = async () => {
      const data = await fetchInvestmentProducts();
      setProducts(data);
      setLoading(false);
    };
    initialLoad();
  }, []);

  const openEdit = (product) => {
    setEditing({ ...product });
    setError(null);
    setSuccess(null);
  };

  const openCreate = () => {
    setEditing({
      id: "",
      name: "",
      type: "",
      category: "gold",
      return_rate: "",
      description: "",
      image: "",
      minimum: 0,
      duration: "6 months",
      active: true,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!editing.id || !editing.name || !editing.type || !editing.return_rate || !editing.minimum) {
        throw new Error("ID, Name, Type, Return Rate, and Minimum are required");
      }

      const fields = {
        name: editing.name,
        type: editing.type,
        category: editing.category,
        return_rate: editing.return_rate,
        description: editing.description,
        image: editing.image,
        minimum: Number(editing.minimum),
        duration: editing.duration,
        active: editing.active,
      };

      if (products.some((product) => product.id === editing.id)) {
        await adminUpdateInvestment(editing.id, fields);
      } else {
        await adminCreateInvestment({ id: editing.id, ...fields });
      }

      setSuccess("Product saved successfully");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this investment product?")) return;
    try {
      await adminDeleteInvestment(id);
      setSuccess("Product deleted");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.type || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "active" ? p.active : !p.active);
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout activeNav="investments">
      <h1 className="admin-page-title">Investment Management</h1>
      <p className="admin-page-subtitle">Manage metals and investment products</p>

      {error && <div className="admin-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{error}</div>}
      {success && <div className="admin-success"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{success}</div>}

      <div className="admin-table-container" style={{ marginBottom: "20px" }}>
        <div className="admin-table-header">
          <h2 className="admin-table-title">Products ({filtered.length})</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="admin-filters">
              <button className={`admin-filter-btn ${filter === "all" ? "admin-filter-btn--active" : ""}`} onClick={() => setFilter("all")}>All</button>
              <button className={`admin-filter-btn ${filter === "active" ? "admin-filter-btn--active" : ""}`} onClick={() => setFilter("active")}>Active</button>
              <button className={`admin-filter-btn ${filter === "inactive" ? "admin-filter-btn--active" : ""}`} onClick={() => setFilter("inactive")}>Inactive</button>
            </div>
            <div className="admin-table-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input type="search" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
            </div>
            <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={openCreate}>+ Add Product</button>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="admin-loading__spinner" style={{ marginBottom: "12px" }}></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Return</th>
                  <th>Minimum</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {product.image && (
                          <img src={product.image} alt="" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }} />
                        )}
                        <div>
                          <div className="admin-table__name">{product.name}</div>
                          <div className="admin-table__email">{product.type}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{product.category}</td>
                    <td>{product.return_rate}</td>
                    <td>{new Intl.NumberFormat("en-US").format(product.minimum)}</td>
                    <td>{product.duration}</td>
                    <td>
                      <span className={`admin-badge ${product.active ? "admin-badge--success" : "admin-badge--danger"}`}>
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => openEdit(product)}>Edit</button>
                        <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(product.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">{products.find(p => p.id === editing.id) ? "Edit Product" : "New Product"}</h3>
              <button className="admin-modal__close" onClick={() => setEditing(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label className="admin-form-label">Product ID</label>
                <input className="admin-form-input" value={editing.id} onChange={(e) => setEditing({ ...editing, id: e.target.value })} required disabled={!!products.find(p => p.id === editing.id)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Name</label>
                  <input className="admin-form-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Type</label>
                  <input className="admin-form-input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select className="admin-form-select" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="palladium">Palladium</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Return Rate</label>
                  <input className="admin-form-input" value={editing.return_rate} onChange={(e) => setEditing({ ...editing, return_rate: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Minimum Investment</label>
                  <input type="number" className="admin-form-input" value={editing.minimum} onChange={(e) => setEditing({ ...editing, minimum: e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Duration</label>
                  <input className="admin-form-input" value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} required />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Image URL</label>
                <input className="admin-form-input" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-textarea" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows="3" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Status</label>
                <select className="admin-form-select" value={editing.active ? "true" : "false"} onChange={(e) => setEditing({ ...editing, active: e.target.value === "true" })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default InvestmentsManagement;
