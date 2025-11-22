"use client";

import useCartStore from "@/store";
import { useEffect } from "react";

interface SuccessClientProps {
  orderNumber?: string;
}

const SuccessClient = ({ orderNumber }: SuccessClientProps) => {
  const clearCart = useCartStore((state) => state.resetCart);

  useEffect(() => {
    if (orderNumber) {
      clearCart();
    }
  }, [orderNumber, clearCart]);

  return null;
};

export default SuccessClient;