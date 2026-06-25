"use client";

import { useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = items.length === 0;

  return (
    <>
      <div
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="cart-drawer-header">
          <h3>🛒 Your Order</h3>
          <button
            className="cart-drawer-close"
            aria-label="Close cart"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="cart-items">
          {isEmpty ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Your cart is empty</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Add some café delights!
              </p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-emoji">{item.emoji}</div>
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{item.price}</div>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))
                      }
                      className="cart-qty-btn"
                    >
                      −
                    </button>
                    <span className="cart-qty">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="cart-qty-btn"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="cart-item-remove"
                    aria-label="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
        {!isEmpty && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="cart-total-row grand">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
            <div className="cart-actions">
              <button
                className="btn btn-primary btn-checkout"
                onClick={onCheckout}
              >
                Checkout · Pay Now 💳
              </button>
              <button className="btn btn-ghost" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="cart-backdrop" onClick={onClose} aria-hidden="true"></div>
      )}
    </>
  );
}
