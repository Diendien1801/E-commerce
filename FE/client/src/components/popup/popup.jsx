import React, { useState } from "react";
import { createPortal } from "react-dom";
import "./popup.css";

const CartPopup = ({ show, message }) => {
  if (!show) return null;

  return createPortal(
    <div className="cart-popup-overlay">
      <div className={`cart-popup ${show ? "show" : ""}`}>
        {message || "Đã thêm vào giỏ hàng!"}
      </div>
    </div>,
    document.getElementById("popup-root")
  );
};

export default CartPopup;
