"use client";

import React, { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { api } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Invalid phone number"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Requires at least one uppercase letter")
    .regex(/[a-z]/, "Requires at least one lowercase letter")
    .regex(/[0-9]/, "Requires at least one number")
    .regex(/[^A-Za-z0-9]/, "Requires at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot-password" | "verify-otp" | "reset-password">("login");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const syncWithServer = useCartStore((state) => state.syncWithServer);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Forgot password states
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  // OTP states
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(600);
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const getPasswordStrength = (pass: string) => {
    if (!pass) return null;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 2) return { text: "Weak", color: "text-red-400", bg: "bg-red-400", width: "w-1/4" };
    if (score === 3) return { text: "Medium", color: "text-yellow-400", bg: "bg-yellow-400", width: "w-2/4" };
    if (score === 4) return { text: "Strong", color: "text-green-400", bg: "bg-green-400", width: "w-3/4" };
    return { text: "Very Strong", color: "text-green-500", bg: "bg-green-500", width: "w-full" };
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        const response = await api.post("/auth/google", { accessToken: tokenResponse.access_token });
        const { user } = response.data;
        setAuth(user);
        await syncWithServer();
        onClose();
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || "Google authentication failed");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setErrorMsg("Google Sign-In was cancelled");
      setIsGoogleLoading(false);
    }
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      termsAccepted: false
    }
  });

  const forgotForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const response = await api.post("/auth/login", data);
      const { user } = response.data;
      setAuth(user);
      await syncWithServer();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Login failed");
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const response = await api.post("/auth/register", data);
      const { user } = response.data;
      setAuth(user);
      await syncWithServer();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Registration failed");
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordValues) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.post("/auth/forgot-password", data);
      setResetEmail(data.email);
      setActiveTab("verify-otp");
      setOtpTimer(600);
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to request reset");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
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
    
    // Focus last filled input
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
      setErrorMsg("Please enter all 6 digits");
      return;
    }
    try {
      setIsVerifying(true);
      setErrorMsg("");
      setSuccessMsg("");
      const response = await api.post("/auth/verify-otp", { email: resetEmail, otp: otpString });
      setResetToken(response.data.resetToken);
      setActiveTab("reset-password");
      resetForm.reset();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.post("/auth/forgot-password", { email: resetEmail });
      setResendTimer(60);
      setSuccessMsg("Verification code resent successfully");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to resend code");
    }
  };

  const onResetSubmit = async (data: ResetPasswordValues) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.post("/auth/reset-password", { resetToken, newPassword: data.password });
      setSuccessMsg("Password reset successfully! You can now log in.");
      setTimeout(() => {
        setActiveTab("login");
        setSuccessMsg("");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#08080D]/60 backdrop-blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative flex w-full max-w-[1000px] overflow-hidden rounded-[24px] border border-white/10 bg-[#08080D]/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-[40px]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-[20px] top-[20px] z-50 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:bg-black/80 hover:text-white md:right-[20px]"
            >
              ✕
            </button>

            {/* Left Auth Panel */}
            <div className="flex w-full flex-col justify-center p-[32px] md:w-[45%] md:p-[48px] relative z-10">

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <img src="/images/download.png" alt="Nukkad Beats Logo" className="h-14 w-auto object-contain" />
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="font-heading text-3xl font-bold text-white mb-2 tracking-tight">
                  {activeTab === "login" && "Welcome Back"}
                  {activeTab === "register" && "Create Account"}
                  {activeTab === "forgot-password" && "Reset Password"}
                  {activeTab === "verify-otp" && "Verify Email"}
                  {activeTab === "reset-password" && "New Password"}
                </h2>
                <p className="text-sm text-white/60 font-light">
                  {activeTab === "login" && "Sign in to continue your NUKKAD BEATS experience."}
                  {activeTab === "register" && "Join us to start your NUKKAD BEATS experience."}
                  {activeTab === "forgot-password" && "Enter your email to receive a verification code."}
                  {activeTab === "verify-otp" && `Code sent to ${resetEmail}`}
                  {activeTab === "reset-password" && "Create a strong password for your account."}
                </p>
              </motion.div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 rounded-[12px] bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 text-center"
                >
                  {errorMsg}
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 rounded-[12px] bg-green-500/10 p-3 text-sm text-green-400 border border-green-500/20 text-center"
                >
                  {successMsg}
                </motion.div>
              )}

              {/* Login Form */}
              {activeTab === "login" && (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <input
                      {...loginForm.register("email")}
                      type="email"
                      id="login-email"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="login-email"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      Email Address
                    </label>
                    {loginForm.formState.errors.email && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      {...loginForm.register("password")}
                      type="password"
                      id="login-password"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="login-password"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      Password
                    </label>
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => { setActiveTab("forgot-password"); setErrorMsg(""); setSuccessMsg(""); }}
                      className="text-xs text-[#D89A2B] hover:underline transition-all hover:text-[#e0a843]"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="mt-4 w-full rounded-full bg-gradient-to-r from-[#D89A2B] to-[#b87d1c] px-6 py-4 font-heading font-bold text-[#12041A] shadow-[0_8px_24px_rgba(216,154,43,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(216,154,43,0.4)] active:scale-[0.98] disabled:opacity-70"
                  >
                    {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                  </button>
                </motion.form>
              )}

              {/* Register Form */}
              {activeTab === "register" && (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <input
                      {...registerForm.register("fullName")}
                      type="text"
                      id="reg-fullname"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="reg-fullname"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      Full Name
                    </label>
                    {registerForm.formState.errors.fullName && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {registerForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      {...registerForm.register("email")}
                      type="email"
                      id="reg-email"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="reg-email"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      Email Address
                    </label>
                    {registerForm.formState.errors.email && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      {...registerForm.register("phone")}
                      type="tel"
                      id="reg-phone"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="reg-phone"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      Phone Number
                    </label>
                    {registerForm.formState.errors.phone && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {registerForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      {...registerForm.register("password")}
                      type="password"
                      id="reg-password"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="reg-password"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      Password
                    </label>
                    {registerForm.formState.errors.password && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-[12px] mt-2 mb-2">
                    <input
                      {...registerForm.register("termsAccepted")}
                      type="checkbox"
                      id="reg-terms"
                      className="mt-[4px] cursor-pointer"
                    />
                    <label htmlFor="reg-terms" className="text-[0.8rem] text-white/60 leading-[1.5]">
                      I have read and agree to the <a href="/privacy" target="_blank" className="text-gold hover:underline">Privacy Policy</a> and <a href="/terms" target="_blank" className="text-gold hover:underline">Terms of Service</a>.
                    </label>
                  </div>
                  {registerForm.formState.errors.termsAccepted && (
                    <p className="mt-[-8px] pl-2 text-xs text-red-400">
                      {registerForm.formState.errors.termsAccepted.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={registerForm.formState.isSubmitting || !registerForm.watch("termsAccepted")}
                    className="mt-2 w-full rounded-full bg-gradient-to-r from-[#D89A2B] to-[#b87d1c] px-6 py-4 font-heading font-bold text-[#12041A] shadow-[0_8px_24px_rgba(216,154,43,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(216,154,43,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {registerForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
                  </button>
                </motion.form>
              )}

              {/* Forgot Password Form */}
              {activeTab === "forgot-password" && (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <input
                      {...forgotForm.register("email")}
                      type="email"
                      id="forgot-email"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="forgot-email"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      Email Address
                    </label>
                    {forgotForm.formState.errors.email && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {forgotForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={forgotForm.formState.isSubmitting}
                    className="mt-4 w-full rounded-full bg-gradient-to-r from-[#D89A2B] to-[#b87d1c] px-6 py-4 font-heading font-bold text-[#12041A] shadow-[0_8px_24px_rgba(216,154,43,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(216,154,43,0.4)] active:scale-[0.98] disabled:opacity-70"
                  >
                    {forgotForm.formState.isSubmitting ? "Sending..." : "Send Verification Code"}
                  </button>
                </motion.form>
              )}

              {/* Verify OTP Form */}
              {activeTab === "verify-otp" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6 items-center"
                >
                  <div className="flex gap-2 justify-center w-full">
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
                        className="w-12 h-14 text-center text-2xl font-bold rounded-[14px] border border-white/20 bg-white/5 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B] focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]"
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-white/60">
                      Code expires in: <span className="font-mono text-[#D89A2B] font-bold">{formatTime(otpTimer)}</span>
                    </p>
                    
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0}
                      className="text-xs text-[#D89A2B] hover:underline transition-all disabled:opacity-50 disabled:no-underline disabled:text-white/40"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend verification code"}
                    </button>
                  </div>

                  <button
                    onClick={verifyOtpSubmit}
                    disabled={isVerifying || otpTimer === 0}
                    className="w-full rounded-full bg-gradient-to-r from-[#D89A2B] to-[#b87d1c] px-6 py-4 font-heading font-bold text-[#12041A] shadow-[0_8px_24px_rgba(216,154,43,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(216,154,43,0.4)] active:scale-[0.98] disabled:opacity-70"
                  >
                    {isVerifying ? "Verifying..." : "Verify Code"}
                  </button>
                </motion.div>
              )}

              {/* Reset Password Form */}
              {activeTab === "reset-password" && (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={resetForm.handleSubmit(onResetSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <input
                      {...resetForm.register("password")}
                      type="password"
                      id="reset-password"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="reset-password"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      New Password
                    </label>
                    {resetForm.formState.errors.password && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {resetForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  {resetForm.watch("password") && getPasswordStrength(resetForm.watch("password")) && (
                    <div className="px-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/60">Password Strength</span>
                        <span className={`text-xs font-bold ${getPasswordStrength(resetForm.watch("password"))?.color}`}>
                          {getPasswordStrength(resetForm.watch("password"))?.text}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getPasswordStrength(resetForm.watch("password"))?.bg} ${getPasswordStrength(resetForm.watch("password"))?.width}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="relative mt-2">
                    <input
                      {...resetForm.register("confirmPassword")}
                      type="password"
                      id="reset-confirm"
                      placeholder=" "
                      className="peer w-full rounded-[18px] border border-white/10 bg-white/5 px-4 pb-2.5 pt-6 text-white outline-none backdrop-blur-md transition-all focus:border-[#D89A2B]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#D89A2B]/50"
                    />
                    <label
                      htmlFor="reset-confirm"
                      className="absolute left-4 top-4 text-sm text-white/50 transition-all cursor-text peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#D89A2B] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]"
                    >
                      Confirm Password
                    </label>
                    {resetForm.formState.errors.confirmPassword && (
                      <p className="mt-1 pl-2 text-xs text-red-400">
                        {resetForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={resetForm.formState.isSubmitting}
                    className="mt-4 w-full rounded-full bg-gradient-to-r from-[#D89A2B] to-[#b87d1c] px-6 py-4 font-heading font-bold text-[#12041A] shadow-[0_8px_24px_rgba(216,154,43,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(216,154,43,0.4)] active:scale-[0.98] disabled:opacity-70"
                  >
                    {resetForm.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                </motion.form>
              )}

              {/* Only show Social and prompt on login/register */}
              {(activeTab === "login" || activeTab === "register") && (
                <>
                  {/* OR Divider */}
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <div className="h-[1px] w-full bg-white/10"></div>
                    <span className="font-heading text-[10px] font-bold tracking-[0.2em] text-white/40">OR</span>
                    <div className="h-[1px] w-full bg-white/10"></div>
                  </div>

                  {/* Google Sign-In */}
                  <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    disabled={isGoogleLoading}
                    className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-white/90 px-6 py-4 font-heading font-bold text-gray-900 shadow-[0_8px_16px_rgba(255,255,255,0.05)] transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_24px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-70"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                  </button>
                </>
              )}

              {/* Bottom Register/Login Prompt */}
              <div className="mt-8 text-center text-sm text-white/60">
                {activeTab === "login" && (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setActiveTab("register"); setErrorMsg(""); setSuccessMsg(""); }}
                      className="font-bold text-[#D89A2B] hover:underline transition-all hover:text-[#e0a843]"
                    >
                      Register Now
                    </button>
                  </>
                )}
                
                {activeTab === "register" && (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setActiveTab("login"); setErrorMsg(""); setSuccessMsg(""); }}
                      className="font-bold text-[#D89A2B] hover:underline transition-all hover:text-[#e0a843]"
                    >
                      Sign In
                    </button>
                  </>
                )}

                {(activeTab === "forgot-password" || activeTab === "verify-otp" || activeTab === "reset-password") && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab("login"); setErrorMsg(""); setSuccessMsg(""); }}
                    className="font-bold text-[#D89A2B] hover:underline transition-all hover:text-[#e0a843]"
                  >
                    Back to Login
                  </button>
                )}
              </div>
            </div>

            {/* Right Visual Panel (Hero) */}
            <div className="hidden w-[55%] relative md:block">
              <img src="/images/auth-promo-bg.png" alt="Nukkad Beats Premium Experience" className="absolute inset-0 h-full w-full object-cover scale-105" />

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
