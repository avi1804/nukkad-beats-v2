"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import { ORDER_STATUS_UPDATED } from "@/socket/events";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} at ${timePart}`;
};

type Tab = "all" | "active" | "completed" | "cancelled";

const orderStatusSteps = ["PENDING", "PREPARING", "READY", "DELIVERED"];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const { user } = useAuthStore();
  const isLoggedIn = !!user;
  const router = useRouter();

  const fetchOrders = React.useCallback(() => {
    orderApi.getUserOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isLoggedIn) {
      // Small delay to allow Zustand persist to hydrate
      timeout = setTimeout(() => {
        router.push("/");
      }, 100);
    } else {
      fetchOrders();
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoggedIn, router, fetchOrders]);

  useSocket(ORDER_STATUS_UPDATED, ({ orderId, status }) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
  });

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") {
      return ["PENDING", "PREPARING", "READY"].includes(order.orderStatus);
    }
    if (activeTab === "completed") {
      return order.orderStatus === "DELIVERED";
    }
    if (activeTab === "cancelled") {
      return order.orderStatus === "CANCELLED";
    }
    return true;
  });

  return (
    <div className="min-h-screen pt-[120px] pb-[80px] bg-bg-deep">
      <div className="max-w-[1000px] mx-auto px-[24px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link href="/" className="inline-flex items-center gap-[8px] text-text-light hover:text-gold transition-colors duration-300 font-[500] mb-[24px]">
            <span>←</span> Back to Home
          </Link>
          <h1 className="font-heading text-[clamp(2rem,3vw,2.5rem)] font-[800] text-text-white mb-[32px]">
            My <span className="gradient-text">Orders</span>
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-[16px] mb-[32px] border-b border-glass-border pb-[16px]">
          {(["all", "active", "completed", "cancelled"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-[20px] py-[8px] rounded-full font-[600] text-[0.95rem] capitalize transition-all border ${
                activeTab === tab
                  ? "bg-gold text-white border-gold"
                  : "text-text-light hover:text-text-white hover:bg-gray-50 border-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-[20px] p-[60px] text-center shadow-sm">
            <span className="text-[4rem] mb-[16px] block opacity-80">🛍️</span>
            <h3 className="font-heading text-[1.4rem] font-[700] text-text-white mb-[8px]">No {activeTab} orders</h3>
            <p className="text-text-muted">You don't have any orders in this category yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border-2 border-gray-200 rounded-[20px] overflow-hidden shadow-sm"
                >
                  <div className="p-[24px] border-b-2 border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[16px]">
                    <div>
                      <span className="text-text-light text-[0.85rem] font-medium">Order Reference</span>
                      <h3 className="font-heading font-[700] text-text-white text-[1.1rem]">
                        {order.orderReference}
                      </h3>
                      <p className="text-text-muted text-[0.8rem] mt-[4px]">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-text-light text-[0.85rem]">Total Amount</span>
                      <h3 className="font-[700] text-gold text-[1.2rem]">
                        ₹{order.totalAmount.toFixed(2)}
                      </h3>
                      <p className="text-text-muted text-[0.8rem] mt-[4px]">
                        Payment: {order.paymentMethod} ({order.paymentStatus})
                      </p>
                    </div>
                  </div>

                  <div className="p-[24px]">
                    {/* Status Tracker (Only for non-cancelled) */}
                    {order.orderStatus !== "CANCELLED" && (
                      <div className="mb-[32px]">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute top-[12px] left-[10%] right-[10%] h-[2px] bg-gray-200 z-0"></div>
                          {orderStatusSteps.map((step, idx) => {
                            const stepIndex = orderStatusSteps.indexOf(order.orderStatus);
                            const isCompleted = idx <= stepIndex;
                            const isCurrent = idx === stepIndex;

                            return (
                              <div key={step} className="flex flex-col items-center gap-[8px] relative z-10 w-[20%]">
                                <div
                                  className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-colors ${
                                    isCurrent ? "bg-gold text-white shadow-[0_0_15px_rgba(216,154,43,0.5)]" : isCompleted ? "bg-gold text-white" : "bg-white border-[3px] border-gray-200 text-transparent"
                                  }`}
                                >
                                  {isCompleted && <span className="text-[0.7rem] font-[700]">✓</span>}
                                </div>
                                <span className={`text-[0.75rem] font-[600] ${isCurrent ? "text-gold" : isCompleted ? "text-text-white" : "text-text-muted"}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {order.orderStatus === "CANCELLED" && (
                      <div className="mb-[24px] p-[16px] rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-400 text-center font-[600]">
                        This order was cancelled.
                      </div>
                    )}

                    <h4 className="font-[600] text-text-white mb-[16px]">Items Ordered</h4>
                    <div className="flex flex-col gap-[12px]">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-[16px] p-[12px] rounded-[12px] bg-gray-50 border border-gray-200">
                          <div className="w-[48px] h-[48px] rounded-[8px] bg-gray-200 overflow-hidden flex-shrink-0">
                            <img src={item.product?.image || "/images/menu/masala_chai.png"} alt={item.product?.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-[600] text-text-white text-[0.95rem]">{item.product?.name || "Unknown Product"}</h5>
                            <p className="text-text-muted text-[0.85rem] font-medium">Qty: {item.quantity} × ₹{item.price}</p>
                          </div>
                          <div className="font-[600] text-text-white">
                            ₹{item.quantity * item.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
