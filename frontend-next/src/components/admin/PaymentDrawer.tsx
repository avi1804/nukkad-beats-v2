import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, Clock, Receipt, User, Store } from "lucide-react";
import { toast } from "react-hot-toast";
import { adminApi } from "@/lib/api";

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  onPaymentUpdated: () => void;
}

export default function PaymentDrawer({ isOpen, onClose, payment, onPaymentUpdated }: PaymentDrawerProps) {
  if (!isOpen || !payment) return null;

  const isStudio = payment.type === "Studio Booking";
  const isVerified = payment.status === "PAID" || payment.status === "VERIFIED";
  const isRejected = payment.status === "FAILED" || payment.status === "REJECTED";
  const isPending = !isVerified && !isRejected;

  const handleAction = async (action: "verify" | "reject" | "pending") => {
    try {
      const type = isStudio ? "booking" : "order";
      // Extract original ID
      const originalId = payment.originalId; 
      
      await adminApi.updatePaymentStatus(type, originalId, action);
      
      toast.success(`Payment ${action === 'verify' ? 'Verified' : action === 'reject' ? 'Rejected' : 'marked as Pending'} successfully!`);
      onPaymentUpdated();
      onClose();
    } catch (error) {
      toast.error(`Failed to ${action} payment.`);
      console.error(error);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[500px] h-full bg-bg-deep border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="text-gold" size={20} />
                Payment Details
              </h2>
              <p className="text-sm text-text-muted mt-1">{payment.reference}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            
            {/* Status Banner */}
            <div className={`p-4 rounded-xl flex items-center gap-3 border ${
              isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              isRejected ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {isVerified ? <CheckCircle size={24} /> : isRejected ? <XCircle size={24} /> : <Clock size={24} />}
              <div>
                <p className="font-bold text-lg">{isVerified ? "VERIFIED" : isRejected ? "REJECTED" : "PENDING"}</p>
                <p className="text-sm opacity-80">
                  {isVerified ? "This payment has been verified and added to revenue." : 
                   isRejected ? "This payment was rejected and is not counted in revenue." : 
                   "Awaiting verification. Not counted in revenue yet."}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
                <User size={16} /> Customer Details
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Name</span>
                  <span className="font-medium text-white">{payment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Email</span>
                  <span className="font-medium text-white">{payment.customerEmail || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Phone</span>
                  <span className="font-medium text-white">{payment.customerPhone || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
                <Store size={16} /> Transaction Details
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Type</span>
                  <span className={`font-medium ${isStudio ? 'text-purple-400' : 'text-orange-400'}`}>{payment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Date & Time</span>
                  <span className="font-medium text-white">{new Date(payment.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Payment Method</span>
                  <span className="font-medium text-white uppercase">{payment.method}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10 mt-1">
                  <span className="text-text-muted font-semibold">Total Amount</span>
                  <span className="font-bold text-xl text-gold">₹{payment.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Specific Items (Cafe) or Studio Details */}
            {payment.items && payment.items.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Order Items</h3>
                <div className="flex flex-col gap-3">
                  {payment.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-white">{item.product?.name || "Item"} <span className="text-text-muted">x{item.quantity}</span></span>
                      <span className="text-text-light">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isStudio && payment.studioDetails && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Studio Details</h3>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Studio</span>
                    <span className="text-white font-medium">{payment.studioDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Booking Date</span>
                    <span className="text-white font-medium">{new Date(payment.studioDetails.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Time Slot</span>
                    <span className="text-white font-medium">{payment.studioDetails.time}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action Footer */}
          <div className="p-6 bg-glass-bg border-t border-glass-border flex flex-col gap-3">
            {isPending && (
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction("reject")}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction("verify")}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  Verify Payment
                </button>
              </div>
            )}
            
            {isVerified && (
              <button 
                onClick={() => handleAction("pending")}
                className="w-full py-3 px-4 rounded-xl font-bold bg-white/5 text-text-light border border-white/10 hover:bg-white/10 transition-colors"
              >
                Mark as Pending
              </button>
            )}

            {isRejected && (
              <button 
                onClick={() => handleAction("pending")}
                className="w-full py-3 px-4 rounded-xl font-bold bg-white/5 text-text-light border border-white/10 hover:bg-white/10 transition-colors"
              >
                Move back to Pending
              </button>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
