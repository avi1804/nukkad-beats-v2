"use client";

import React, { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../lib/api";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"login" | "forgot-password" | "verify-otp" | "reset-password">("login");
  
  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password states
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  // OTP states
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(600);
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "verify-otp") {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      
      if (res.data.user.role !== "ADMIN") {
        toast.error("Unauthorized. Admin access required.");
        setIsLoading(false);
        return;
      }

      setAuth(res.data.user);
      toast.success("Welcome back, Admin!");
      router.push("/nukkadkaadmin");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your admin email");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: resetEmail });
      toast.success("Verification code sent!");
      setActiveTab("verify-otp");
      setOtpTimer(600);
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to request reset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    if (focusIndex < 6) {
      otpRefs.current[focusIndex]?.focus();
    } else {
      otpRefs.current[5]?.focus();
    }
  };

  const verifyOtpSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    try {
      setIsVerifying(true);
      const response = await api.post("/auth/verify-otp", { email: resetEmail, otp: otpString });
      setResetToken(response.data.resetToken);
      setActiveTab("reset-password");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("OTP Verified!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post("/auth/forgot-password", { email: resetEmail });
      setResendTimer(60);
      toast.success("Verification code resent");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to resend code");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    // Simple frontend validation
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      toast.error("Password must be at least 8 chars and include upper, lower, number, and special char.");
      return;
    }

    setIsResetting(true);
    try {
      await api.post("/auth/reset-password", { resetToken, newPassword });
      toast.success("Password reset successfully! You can now log in.");
      setActiveTab("login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", margin: 0, letterSpacing: "2px" }}>
            NUKKAD <span style={{ color: "var(--gold)" }}>ADMIN</span>
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {activeTab === "login" && "Secure Management Portal"}
            {activeTab === "forgot-password" && "Reset Password"}
            {activeTab === "verify-otp" && "Verify OTP"}
            {activeTab === "reset-password" && "Set New Password"}
          </p>
        </div>

        {activeTab === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>Admin Email</label>
              <input 
                type="email" 
                className="form-select"
                style={{ background: "var(--bg-main)", padding: "14px" }}
                placeholder="nukkadbeatsofficial@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>Password</label>
              <input 
                type="password" 
                className="form-select"
                style={{ background: "var(--bg-main)", padding: "14px" }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-12px" }}>
              <button
                type="button"
                onClick={() => { setActiveTab("forgot-password"); setResetEmail(email); }}
                style={{ background: "transparent", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: "4px", fontSize: "1rem" }}
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Secure Login"}
            </button>
          </form>
        )}

        {activeTab === "forgot-password" && (
          <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>Enter Admin Email</label>
              <input 
                type="email" 
                className="form-select"
                style={{ background: "var(--bg-main)", padding: "14px" }}
                placeholder="nukkadbeatsofficial@gmail.com"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: "12px", fontSize: "1rem" }}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {activeTab === "verify-otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", width: "100%" }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  style={{
                    width: "48px", height: "56px", textAlign: "center", fontSize: "1.5rem", fontWeight: "bold",
                    borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "var(--bg-main)",
                    color: "white", outline: "none"
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                Code expires in: <span style={{ fontFamily: "monospace", color: "var(--gold)", fontWeight: "bold" }}>{formatTime(otpTimer)}</span>
              </p>
              
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                style={{
                  background: "transparent", border: "none", color: resendTimer > 0 ? "rgba(255,255,255,0.4)" : "var(--gold)",
                  cursor: resendTimer > 0 ? "default" : "pointer", fontSize: "0.75rem", textDecoration: resendTimer > 0 ? "none" : "underline"
                }}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend verification code"}
              </button>
            </div>

            <button
              onClick={verifyOtpSubmit}
              disabled={isVerifying || otpTimer === 0}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1rem" }}
            >
              {isVerifying ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}

        {activeTab === "reset-password" && (
          <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>New Password</label>
              <input 
                type="password" 
                className="form-select"
                style={{ background: "var(--bg-main)", padding: "14px" }}
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>Confirm New Password</label>
              <input 
                type="password" 
                className="form-select"
                style={{ background: "var(--bg-main)", padding: "14px" }}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: "12px", fontSize: "1rem" }}
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {activeTab !== "login" && (
            <button 
              onClick={() => setActiveTab("login")}
              style={{ background: "transparent", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              ← Back to Login
            </button>
          )}
          <button 
            onClick={() => router.push("/")}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem" }}
          >
            ← Return to Public Site
          </button>
        </div>
      </div>
    </div>
  );
}
