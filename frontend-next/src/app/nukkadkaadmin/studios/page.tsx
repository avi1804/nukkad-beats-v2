"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2, Users, DollarSign } from "lucide-react";

export default function AdminStudios() {
  const [studios, setStudios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudio, setCurrentStudio] = useState<any>({
    name: "", description: "", capacity: 5, pricePerHour: 1000, isActive: true, image: ""
  });

  const fetchStudios = async () => {
    try {
      const res = await api.get("/admin/studios");
      setStudios(res.data);
    } catch (error) {
      toast.error("Failed to fetch studios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  const handleOpenModal = (studio?: any) => {
    if (studio) {
      setCurrentStudio(studio);
      setIsEditing(true);
    } else {
      setCurrentStudio({
        name: "", description: "", capacity: 5, pricePerHour: 1000, isActive: true, image: ""
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudio.image) {
      toast.error("Please upload an image first");
      return;
    }
    try {
      const payload = {
        name: currentStudio.name,
        description: currentStudio.description,
        capacity: currentStudio.capacity,
        pricePerHour: currentStudio.pricePerHour,
        isActive: currentStudio.isActive,
        image: currentStudio.image
      };

      if (isEditing) {
        await api.put(`/admin/studios/${currentStudio.id}`, payload);
        toast.success("Studio updated");
      } else {
        await api.post("/admin/studios", payload);
        toast.success("Studio created");
      }
      setIsModalOpen(false);
      fetchStudios();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save studio");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/studios/${id}`);
      toast.success("Studio deleted");
      fetchStudios();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete studio");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/studios/${id}`, { isActive: !currentStatus });
      toast.success(currentStatus ? "Studio deactivated" : "Studio activated");
      fetchStudios();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return <div className="checkout-spinner" style={{ margin: "100px auto" }}></div>;
  }

  return (
    <div className="admin-studios">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem" }}>Studio Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add New Studio
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {studios.map(studio => (
          <div key={studio.id} style={{ 
            background: "var(--bg-card)", 
            border: "1px solid var(--border)", 
            borderRadius: "12px", 
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            opacity: studio.isActive ? 1 : 0.6
          }}>
            <div style={{ height: "160px", background: "#333", backgroundImage: `url(${studio.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
              {!studio.isActive && (
                <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(220,53,69,0.9)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                  INACTIVE
                </div>
              )}
            </div>
            
            <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", fontFamily: "var(--font-display)" }}>{studio.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px", flex: 1 }}>{studio.description}</p>
              
              <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <Users size={14} color="var(--gold)" />
                  {studio.capacity} Guests
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <DollarSign size={14} color="var(--gold)" />
                  ₹{studio.pricePerHour}/hr
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", justifyContent: "center" }}
                  onClick={() => toggleStatus(studio.id, studio.isActive)}
                >
                  {studio.isActive ? "Deactivate" : "Activate"}
                </button>
                <button 
                  className="btn" 
                  style={{ padding: "0 12px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "none" }}
                  onClick={() => handleOpenModal(studio)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn" 
                  style={{ padding: "0 12px", background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "none" }}
                  onClick={() => handleDelete(studio.id)}
                >
                  <Trash2 size={16} />
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
              {isEditing ? "Edit Studio" : "Add New Studio"}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Studio Name</label>
                <input required type="text" className="form-select" value={currentStudio.name} onChange={e => setCurrentStudio({...currentStudio, name: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea required className="form-select" rows={3} value={currentStudio.description} onChange={e => setCurrentStudio({...currentStudio, description: e.target.value})}></textarea>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Capacity (Guests)</label>
                  <input required type="number" min="1" className="form-select" value={currentStudio.capacity} onChange={e => setCurrentStudio({...currentStudio, capacity: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Price per Hour (₹)</label>
                  <input required type="number" min="0" className="form-select" value={currentStudio.pricePerHour} onChange={e => setCurrentStudio({...currentStudio, pricePerHour: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label>Studio Image</label>
                {currentStudio.image && (
                  <div style={{ marginBottom: "12px", position: "relative", width: "fit-content" }}>
                    <img src={currentStudio.image} alt="Preview" style={{ height: "120px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }} />
                    <button type="button" onClick={() => setCurrentStudio({...currentStudio, image: ""})} style={{ position: "absolute", top: -8, right: -8, background: "rgba(220,53,69,0.9)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>×</button>
                  </div>
                )}
                {!currentStudio.image && (
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
                        formData.append("folder", "studios");
                        
                        const toastId = toast.loading("Uploading image...");
                        try {
                          const res = await api.post("/upload", formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                          });
                          setCurrentStudio({ ...currentStudio, image: res.data.url });
                          toast.success("Image uploaded", { id: toastId });
                        } catch (error: any) {
                          toast.error(error.response?.data?.error || "Failed to upload image", { id: toastId });
                          console.error(error);
                        }
                      }
                    }} 
                  />
                )}
                {!currentStudio.image && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>Upload a JPEG, PNG, or WEBP image.</p>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                <input type="checkbox" id="isActive" checked={currentStudio.isActive} onChange={e => setCurrentStudio({...currentStudio, isActive: e.target.checked})} style={{ width: "18px", height: "18px", accentColor: "var(--gold)" }} />
                <label htmlFor="isActive" style={{ cursor: "pointer" }}>Is Active and Bookable</label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn" style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", justifyContent: "center" }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Save Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
