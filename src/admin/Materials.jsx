import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { fetchInvestmentProducts, fetchInvestmentMaterials } from "./services/adminData";
import { adminUpsertMaterials } from "./services/adminActions";
import "./admin.css";

const InvestmentMaterials = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const initialLoad = async () => {
      const data = await fetchInvestmentProducts();
      setProducts(data.filter((product) => product.active));
      setLoading(false);
    };
    initialLoad();
  }, []);

  const selectProduct = async (product) => {
    setSelectedProduct(product);
    setError(null);
    setSuccess(null);
    const data = await fetchInvestmentMaterials(product.id);
    setMaterials(data || {
      description: "",
      information: "",
      educational_content: "",
      comments: "",
      important_info: "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await adminUpsertMaterials(selectedProduct.id, materials);
      setSuccess("Materials saved successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateMaterial = (field, value) => {
    setMaterials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout activeNav="materials">
      <h1 className="admin-page-title">Investment Materials</h1>
      <p className="admin-page-subtitle">Add descriptions, educational content, and comments to investments</p>

      {error && <div className="admin-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{error}</div>}
      {success && <div className="admin-success"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: selectedProduct ? "280px 1fr" : "1fr", gap: "20px" }}>
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2 className="admin-table-title">Products</h2>
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
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => selectProduct(product)}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {product.image && (
                            <img src={product.image} alt="" style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover" }} />
                          )}
                          <div className="admin-table__name">{product.name}</div>
                        </div>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{product.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedProduct && materials && (
          <div className="admin-table-container" style={{ animation: "adminFadeIn 0.3s ease-out" }}>
            <div className="admin-table-header">
              <h2 className="admin-table-title">{selectedProduct.name} — Materials</h2>
            </div>
            <form onSubmit={handleSave} style={{ padding: "20px" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea
                  className="admin-form-textarea"
                  value={materials.description}
                  onChange={(e) => updateMaterial("description", e.target.value)}
                  rows="3"
                  placeholder="Product description..."
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Investment Information</label>
                <textarea
                  className="admin-form-textarea"
                  value={materials.information}
                  onChange={(e) => updateMaterial("information", e.target.value)}
                  rows="4"
                  placeholder="Key investment facts and figures..."
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Educational Content</label>
                <textarea
                  className="admin-form-textarea"
                  value={materials.educational_content}
                  onChange={(e) => updateMaterial("educational_content", e.target.value)}
                  rows="4"
                  placeholder="Educational material about this investment..."
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Comments / Notes</label>
                <textarea
                  className="admin-form-textarea"
                  value={materials.comments}
                  onChange={(e) => updateMaterial("comments", e.target.value)}
                  rows="3"
                  placeholder="Internal notes or comments..."
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Important Information</label>
                <textarea
                  className="admin-form-textarea"
                  value={materials.important_info}
                  onChange={(e) => updateMaterial("important_info", e.target.value)}
                  rows="3"
                  placeholder="Important disclaimers or warnings..."
                />
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setSelectedProduct(null)} disabled={saving}>Close</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Materials"}
                </button>
              </div>
            </form>
          </div>
        )}

        {!selectedProduct && !loading && (
          <div className="admin-table-container">
            <div className="admin-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>Select a product</p>
              <span>Choose an investment product from the list to manage its materials and content</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InvestmentMaterials;
