"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { productApi } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import { useBookingStore } from "@/store/useBookingStore";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { 
  PRODUCT_ADDED, 
  PRODUCT_UPDATED, 
  PRODUCT_DELETED, 
  PRODUCT_AVAILABILITY_CHANGED 
} from "@/socket/events";

type CafeCategory = "all" | "beverages" | "snacks" | "fast-food" | "desserts";

export default function Cafe() {
  const [filter, setFilter] = useState<CafeCategory>("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeBookingId, setActiveBookingId } = useBookingStore();
  const router = useRouter();

  const fetchProducts = () => {
    productApi.getProducts()
      .then(res => {
        const grouped = res.data;
        const allProducts = Object.values(grouped).flat() as any[];
        allProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setProducts(allProducts);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useSocket(PRODUCT_ADDED, fetchProducts);
  useSocket(PRODUCT_UPDATED, fetchProducts);
  useSocket(PRODUCT_DELETED, fetchProducts);
  useSocket(PRODUCT_AVAILABILITY_CHANGED, fetchProducts);

  const filteredItems = products.filter(
    (item) => filter === "all" || (item.category?.slug && item.category.slug === filter)
  );

  return (
    <section className="py-[70px] md:py-[100px] bg-bg-deep" id="cafe">
      <div className="max-w-[1200px] mx-auto px-[24px]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-40px" }}
        >
          <span className="inline-block text-[0.75rem] font-[600] tracking-[0.2em] uppercase text-gold mb-[12px] relative pl-[28px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[18px] before:h-[2px] before:bg-gold">
            Café Menu
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-[800] leading-[1.15] mb-[16px] text-text-white">
            Fuel Your <span className="gradient-text">Performance</span>
          </h2>
          <p className="text-text-muted max-w-[520px] text-[0.95rem]">
            Handcrafted beverages, irresistible snacks, and comfort food —
            delivered right to your studio or enjoyed at our lounge.
          </p>
          
          {activeBookingId && (
            <div className="mt-[24px] bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] rounded-[16px] p-[20px] flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px]">
              <div>
                <h3 className="text-gold font-[700] flex items-center gap-[8px] mb-[4px]">
                  <span>🎤</span> Studio Booking Detected
                </h3>
                <p className="text-text-light text-[0.9rem] m-0">
                  Your café order will be combined with your booking into a single payment.
                </p>
              </div>
              <button 
                onClick={() => {
                  router.push(`/payment/booking/${activeBookingId}`);
                }}
                className="whitespace-nowrap px-[16px] py-[8px] rounded-[10px] bg-white hover:bg-gray-50 text-text-white font-[600] text-[0.85rem] transition-colors border border-glass-border shadow-sm"
              >
                Skip Food → Pay Now
              </button>
            </div>
          )}
        </motion.div>

        <div className="flex md:flex-wrap gap-[12px] mb-[30px] md:mb-[40px] mt-[30px] overflow-x-auto hide-scrollbar pb-[10px] -mx-[24px] px-[24px] md:mx-0 md:px-0">
          {(["all", "beverages", "snacks", "fast-food", "desserts"] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-[20px] py-[8px] rounded-[100px] font-[500] text-[0.9rem] border transition-all duration-300 capitalize cursor-pointer",
                  filter === cat
                    ? "bg-text-white text-bg-deep border-transparent shadow-sm"
                    : "bg-transparent text-text-light border-glass-border hover:bg-glass-bg hover:text-text-white hover:border-glass-border shadow-sm"
                )}
              >
                <span className="whitespace-nowrap">{cat.replace("-", " ")}</span>
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-[16px] md:gap-[20px]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <CafeCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function CafeCard({ item }: { item: any }) {
  const [qty, setQty] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart(item, qty);
    toast.success(`Added ${qty} ${item.name} to cart!`, {
      style: {
        background: '#FFFFFF',
        color: '#111827',
        border: '1px solid #E7E7E7',
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)'
      },
      iconTheme: {
        primary: '#D4AF37',
        secondary: '#fff',
      },
    });
    setQty(1); // Reset qty
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="bg-white md:bg-glass-bg border border-glass-border rounded-[20px] overflow-hidden flex flex-row md:flex-col transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:border-gold/30 group"
    >
      <div className="h-[140px] w-[130px] md:h-[180px] md:w-full relative overflow-hidden bg-gray-50 shrink-0">
        <img
          src={item.image || "/images/menu/masala_chai.png"}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {item.tag && (
          <span
            className={cn(
              "absolute top-[8px] right-[8px] md:top-[12px] md:right-[12px] text-white text-[0.6rem] md:text-[0.65rem] font-[700] px-[8px] py-[3px] md:px-[10px] md:py-[4px] rounded-[100px] z-10",
              item.tagClass
            )}
          >
            {item.tag}
          </span>
        )}
      </div>
      <div className="p-[14px] md:p-[20px] flex flex-col flex-1">
        <div className="font-heading font-[700] text-[1rem] md:text-[1.1rem] mb-[4px] md:line-clamp-2 md:min-h-[2.8rem] text-text-white">
          {item.name}
        </div>
        <div className="text-[0.7rem] md:text-[0.78rem] text-text-muted mb-[8px] md:mb-[16px] leading-[1.4] flex-1 line-clamp-2 md:line-clamp-3">
          {item.description || item.desc}
        </div>
        <div className="flex items-center gap-[6px] mb-[12px] md:mb-[16px]">
          <span className="text-gold text-[0.75rem] md:text-[0.85rem] tracking-[1px]">★★★★★</span>
          <span className="text-[0.65rem] md:text-[0.75rem] text-text-muted">
            {item.rating || 4.5} ({item.reviews || Math.floor(Math.random() * 100 + 20)})
          </span>
        </div>
        <div className="flex items-center justify-between mt-auto md:flex-col md:items-stretch md:gap-[16px]">
          <div className="font-heading font-[800] text-[1rem] md:text-[1.25rem] text-text-white">
            ₹{item.price}
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:gap-[10px] md:w-full">
            <div className="hidden md:flex items-center justify-between bg-gray-50 rounded-[10px] border border-glass-border overflow-hidden min-w-[90px] h-[40px] px-[4px]">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-[28px] h-[28px] flex items-center justify-center bg-transparent border-none text-text-light cursor-pointer transition-colors hover:bg-gray-200 hover:text-text-white rounded-[6px]"
              >
                −
              </button>
              <span className="w-[20px] text-center text-[0.85rem] font-[600] text-text-white">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-[28px] h-[28px] flex items-center justify-center bg-transparent border-none text-text-light cursor-pointer transition-colors hover:bg-gray-200 hover:text-text-white rounded-[6px]"
              >
                +
              </button>
            </div>
            <button
              className="px-[16px] py-[8px] md:flex-1 md:py-[0] md:h-[40px] rounded-[10px] md:rounded-[12px] bg-gold/10 border border-gold/20 text-gold font-[600] text-[0.75rem] md:text-[0.85rem] transition-all duration-500 hover:bg-gold hover:text-white hover:shadow-lg active:scale-95 cursor-pointer"
              onClick={handleAddToCart}
            >
              <span className="md:hidden">ADD</span>
              <span className="hidden md:inline">+ Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
