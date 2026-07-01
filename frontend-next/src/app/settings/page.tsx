"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { 
  User, Shield, Bell, Laptop, AlertTriangle, 
  Save, CheckCircle, Smartphone, MapPin, 
  LogOut, Trash2 
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

type TabType = "profile" | "security" | "preferences" | "sessions" | "danger";

export default function SettingsPage() {
  const { user, logout, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  if (!user) {
    return (
      <div className="min-h-screen bg-bg-deep text-text-light font-body pt-[100px] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-200">
            <User size={32} className="text-gray-400" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-text-white mb-3">Access Restricted</h2>
          <p className="text-text-muted mb-8 max-w-md">
            You need to be logged in to access your account settings. Please sign in or return to the home page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => document.getElementById("sign-in-btn")?.click()} // Simplistic trigger if needed, or just let them use Navbar
              className="px-8 py-3 rounded-full bg-gold text-[#12041A] font-bold shadow-[0_8px_24px_rgba(216,154,43,0.25)] transition-all hover:-translate-y-1"
            >
              Sign In
            </button>
            <a 
              href="/"
              className="px-8 py-3 rounded-full bg-gray-50 text-text-light font-medium border border-gray-200 transition-all hover:bg-gray-100 hover:-translate-y-1"
            >
              Back to Home
            </a>
          </div>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Bell },
    { id: "sessions", label: "Active Sessions", icon: Laptop },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
  ];

  return (
    <div className="min-h-screen bg-bg-deep text-text-light font-body pt-[100px]">
      <Navbar />
      
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link href="/" className="inline-flex items-center gap-[8px] text-text-light hover:text-gold transition-colors duration-300 font-[500] mb-[24px]">
            <span>←</span> Back to Home
          </Link>
          <h1 className="font-heading text-4xl font-bold text-text-white mb-2">Account Settings</h1>
          <p className="text-text-muted">Manage your personal information and security preferences.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-[280px] flex-shrink-0">
            <div className="bg-white border-2 border-gray-200 rounded-[20px] p-4 backdrop-blur-md sticky top-[120px] shadow-sm">
              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium transition-all duration-300 ${
                        isActive 
                          ? tab.danger 
                            ? "bg-red-50 text-red-600 border border-red-200" 
                            : "bg-gold text-white"
                          : "text-text-muted hover:bg-gray-50 hover:text-text-white border border-transparent"
                      }`}
                    >
                      <Icon size={18} className={isActive ? (tab.danger ? "text-red-600" : "text-white") : "text-text-muted"} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "profile" && <ProfileSection />}
                {activeTab === "security" && <SecuritySection />}
                {activeTab === "preferences" && <PreferencesSection />}
                {activeTab === "sessions" && <SessionsSection />}
                {activeTab === "danger" && <DangerSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Sections ---

function ProfileSection() {
  const { user, setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: "", // Fetch from API ideally
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch latest profile data
    api.get("/users/profile").then(res => {
      setFormData(prev => ({ ...prev, phone: res.data.phone || "" }));
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.phone || dataToSubmit.phone.trim() === '') {
        delete (dataToSubmit as any).phone;
      }
      const res = await api.put("/users/profile", dataToSubmit);
      setAuth(res.data);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-[20px] p-8 backdrop-blur-md shadow-sm">
      <h2 className="text-2xl font-heading font-bold text-text-white mb-6">Profile Information</h2>
      
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
        <div className="w-24 h-24 rounded-full bg-gold flex items-center justify-center font-heading text-4xl font-bold text-white shadow-[0_0_20px_rgba(216,154,43,0.3)]">
          {user?.fullName?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <button className="px-4 py-2 rounded-xl bg-gray-100 text-text-white font-medium text-sm border border-gray-200 hover:bg-gray-200 transition-colors">
            Change Avatar
          </button>
          <p className="text-xs text-text-muted mt-2">JPG, GIF or PNG. Max size of 800K</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Email Address (Read Only)</label>
            <input 
              type="email" 
              value={user?.email || ""}
              readOnly
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 "
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-bold shadow-[0_8px_20px_rgba(216,154,43,0.2)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(216,154,43,0.3)] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isLoading ? "Saving..." : "Save Changes"}
            <Save size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

function SecuritySection() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulated Google Auth check
  const isGoogleAuth = user?.role === 'user' && !user?.fullName.includes('admin'); 

  if (isGoogleAuth) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-[20px] p-8 backdrop-blur-md shadow-sm">
        <h2 className="text-2xl font-heading font-bold text-text-white mb-2">Security</h2>
        <p className="text-text-muted mb-6">Manage your password and authentication.</p>
        
        <div className="p-6 rounded-xl border border-blue-200 bg-blue-50 flex items-start gap-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-text-white font-bold mb-1">Managed by Google</h3>
            <p className="text-text-muted text-sm">
              Your account is authenticated using Google Sign-In. To change your password or security settings, please visit your Google Account settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setIsLoading(true);
    try {
      await api.put("/users/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success("Password updated successfully");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-[20px] p-8 backdrop-blur-md shadow-sm">
      <h2 className="text-2xl font-heading font-bold text-text-white mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">Current Password</label>
          <input 
            type="password" 
            value={formData.currentPassword}
            onChange={e => setFormData({...formData, currentPassword: e.target.value})}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">New Password</label>
          <input 
            type="password" 
            value={formData.newPassword}
            onChange={e => setFormData({...formData, newPassword: e.target.value})}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">Confirm New Password</label>
          <input 
            type="password" 
            value={formData.confirmPassword}
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            required
          />
        </div>
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gold/10 text-gold border border-gold/20 font-bold hover:bg-gold hover:text-black transition-all disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PreferencesSection() {
  const [prefs, setPrefs] = useState({
    bookingEmails: true,
    promotionalEmails: false,
    whatsappReminders: true,
  });

  useEffect(() => {
    api.get("/users/preferences").then(res => {
      if (res.data) setPrefs(res.data);
    }).catch(console.error);
  }, []);

  const handleToggle = async (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    try {
      await api.put("/users/preferences", newPrefs);
      toast.success("Preferences saved automatically");
    } catch (e) {
      toast.error("Failed to save preferences");
      // Revert on fail
      setPrefs(prefs);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-[20px] p-8 backdrop-blur-md shadow-sm">
      <h2 className="text-2xl font-heading font-bold text-text-white mb-2">Notification Preferences</h2>
      <p className="text-text-muted mb-8">Choose how you want to be notified about your bookings and our offers.</p>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div>
            <h4 className="text-text-white font-medium">Booking Confirmations</h4>
            <p className="text-sm text-text-muted">Receive emails when you book or cancel a studio.</p>
          </div>
          <button 
            onClick={() => handleToggle('bookingEmails')}
            className={`w-12 h-6 rounded-full transition-colors relative ${prefs.bookingEmails ? 'bg-gold' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${prefs.bookingEmails ? 'translate-x-6' : 'translate-x-0 shadow-sm border border-gray-300'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div>
            <h4 className="text-text-white font-medium">WhatsApp Reminders</h4>
            <p className="text-sm text-text-muted">Get a text message 2 hours before your booking starts.</p>
          </div>
          <button 
            onClick={() => handleToggle('whatsappReminders')}
            className={`w-12 h-6 rounded-full transition-colors relative ${prefs.whatsappReminders ? 'bg-gold' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${prefs.whatsappReminders ? 'translate-x-6' : 'translate-x-0 shadow-sm border border-gray-300'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div>
            <h4 className="text-text-white font-medium">Promotional Offers</h4>
            <p className="text-sm text-text-muted">Exclusive deals, new studio announcements, and cafe specials.</p>
          </div>
          <button 
            onClick={() => handleToggle('promotionalEmails')}
            className={`w-12 h-6 rounded-full transition-colors relative ${prefs.promotionalEmails ? 'bg-gold' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${prefs.promotionalEmails ? 'translate-x-6' : 'translate-x-0 shadow-sm border border-gray-300'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionsSection() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/users/sessions");
      setSessions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/users/sessions/${id}`);
      toast.success("Session revoked");
      fetchSessions();
    } catch (e) {
      toast.error("Failed to revoke session");
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-[20px] p-8 backdrop-blur-md shadow-sm">
      <h2 className="text-2xl font-heading font-bold text-text-white mb-2">Active Sessions</h2>
      <p className="text-text-muted mb-8">These devices are currently signed in to your account. Revoke any sessions that you do not recognize.</p>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gray-200 text-gray-600">
                {session.device.includes("MacBook") ? <Laptop size={20} /> : <Smartphone size={20} />}
              </div>
              <div>
                <h4 className="text-text-white font-medium flex items-center gap-2">
                  {session.device} · {session.browser}
                  {session.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">Current</span>
                  )}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {session.location}</span>
                  <span>{new Date(session.lastActive).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {!session.isCurrent && (
              <button 
                onClick={() => handleRevoke(session.id)}
                className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={() => handleRevoke('all')}
          className="text-sm font-medium text-text-light hover:text-text-white transition-colors"
        >
          Sign out of all other sessions
        </button>
      </div>
    </div>
  );
}

function DangerSection() {
  const { logout } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/users/profile");
      toast.success("Account deleted successfully.");
      setTimeout(logout, 1500);
    } catch (e) {
      toast.error("Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border-2 border-red-200 rounded-[20px] p-8 backdrop-blur-md shadow-sm">
      <h2 className="text-2xl font-heading font-bold text-red-600 mb-2">Danger Zone</h2>
      <p className="text-text-muted mb-8">Irreversible actions regarding your account.</p>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border border-gray-200 bg-gray-50 gap-4">
          <div>
            <h4 className="text-text-white font-medium">Log out</h4>
            <p className="text-sm text-text-muted mt-1">Sign out of your account on this device.</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-text-white font-medium border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border border-red-200 bg-red-50 gap-4">
          <div>
            <h4 className="text-red-600 font-bold">Delete Account</h4>
            <p className="text-sm text-red-600/80 mt-1 max-w-md">
              Once you delete your account, there is no going back. Please be certain. All your bookings and data will be permanently erased.
            </p>
          </div>
          
          {!showConfirm ? (
            <button 
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-100 text-red-600 font-bold border border-red-200 hover:bg-red-600 hover:text-white transition-colors flex-shrink-0"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-text-muted hover:text-text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
