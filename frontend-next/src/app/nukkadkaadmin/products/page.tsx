"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2, Tag, Coffee } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>({
    name: "", description: "", price: 100, categoryId: "", image: "", isAvailable: true
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/admin/products"),
        api.get("/products/categories")
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product?: any) => {
    if (product) {
      setCurrentProduct({
        ...product,
        categoryId: product.categoryId
      });
      setIsEditing(true);
    } else {
      setCurrentProduct({
        name: "", description: "", price: 100, categoryId: categories[0]?.id || "", image: "", isAvailable: true
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.image) {
      toast.error("Please upload an image first");
      return;
    }
    try {
      const payload = {
        name: currentProduct.name,
        description: currentProduct.description,
        price: currentProduct.price,
        categoryId: currentProduct.categoryId,
        image: currentProduct.image,
        isAvailable: currentProduct.isAvailable
      };
      
      if (isEditing) {
        await api.put(`/admin/products/${currentProduct.id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/admin/products", payload);
        toast.success("Product created");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success("Product deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/products/${id}`, { isAvailable: !currentStatus });
      toast.success(currentStatus ? "Marked as out of stock" : "Marked as available");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return <div className="checkout-spinner" style={{ margin: "100px auto" }}></div>;
  }

  return (
    <div className="admin-products">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem" }}>Cafe Products</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
        {products.map(product => (
          <div key={product.id} style={{ 
            background: "var(--bg-card)", 
            border: "1px solid var(--border)", 
            borderRadius: "12px", 
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            opacity: product.isAvailable ? 1 : 0.6
          }}>
            <div style={{ height: "140px", background: "#333", backgroundImage: `url(${product.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
              {!product.isAvailable && (
                <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(220,53,69,0.9)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                  OUT OF STOCK
                </div>
              )}
            </div>
            
            <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "1.1rem", margin: 0, fontFamily: "var(--font-display)" }}>{product.name}</h3>
                <span style={{ fontWeight: 600, color: "var(--gold)" }}>₹{product.price}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--gold)", marginBottom: "8px", background: "rgba(220, 165, 80, 0.1)", padding: "4px 8px", borderRadius: "4px", alignSelf: "flex-start" }}>
                <Tag size={12} /> {product.category.name}
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px", flex: 1 }}>{product.description}</p>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", justifyContent: "center", fontSize: "0.8rem", padding: "8px" }}
                  onClick={() => toggleAvailability(product.id, product.isAvailable)}
                >
                  {product.isAvailable ? "Mark Out of Stock" : "Mark Available"}
                </button>
                <button 
                  className="btn" 
                  style={{ padding: "0 10px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "none" }}
                  onClick={() => handleOpenModal(product)}
                >
                  <Edit size={14} />
                </button>
                <button 
                  className="btn" 
                  style={{ padding: "0 10px", background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "none" }}
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-deep)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "500px",
            maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
          }}>
            <h2 style={{ marginBottom: "24px", fontFamily: "var(--font-display)" }}>
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Product Name</label>
                <input required type="text" className="form-select" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea required className="form-select" rows={3} value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}></textarea>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input required type="number" min="0" className="form-select" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select required className="form-select" value={currentProduct.categoryId} onChange={e => setCurrentProduct({...currentProduct, categoryId: e.target.value})}>
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                {currentProduct.image && (
                  <div style={{ marginBottom: "12px", position: "relative", width: "fit-content" }}>
                    <img src={currentProduct.image} alt="Preview" style={{ height: "120px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }} />
                    <button type="button" onClick={() => setCurrentProduct({...currentProduct, image: ""})} style={{ position: "absolute", top: -8, right: -8, background: "rgba(220,53,69,0.9)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>×</button>
                  </div>
                )}
                {!currentProduct.image && (
                  <input 
                    required 
                    type="file" 
                    accept="image/*"
                    className="form-select"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        formData.append("folder", "products");
                        
                        const toastId = toast.loading("Uploading image...");
                        try {
                          const res = await api.post("/upload", formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                          });
                          setCurrentProduct({ ...currentProduct, image: res.data.url });
                          toast.success("Image uploaded", { id: toastId });
                        } catch (error: any) {
                          toast.error(error.response?.data?.error || "Failed to upload image", { id: toastId });
                          console.error(error);
                        }
                      }
                    }} 
                  />
                )}
                {!currentProduct.image && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>Upload a JPEG, PNG, or WEBP image.</p>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                <input type="checkbox" id="isAvailable" checked={currentProduct.isAvailable} onChange={e => setCurrentProduct({...currentProduct, isAvailable: e.target.checked})} style={{ width: "18px", height: "18px", accentColor: "var(--gold)" }} />
                <label htmlFor="isAvailable" style={{ cursor: "pointer" }}>Is Available in stock</label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn" style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", justifyContent: "center" }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
