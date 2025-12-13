"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { Product } from "@/sanity.types";
import useWishlistStore from "@/store/wishlistStore";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  className = "",
  size = "md",
}) => {
  const { user } = useUser();
  const { toggleItem, isWishlisted: isGuestWishlisted } = useWishlistStore();
  const [isServerWishlisted, setIsServerWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isWishlisted = user ? isServerWishlisted : isGuestWishlisted(product._id);

  const toggleWishlist = async () => {
    setIsLoading(true);
    
    try {
      if (user) {
        const response = await fetch("/api/wishlist/toggle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product._id }),
        });

        const data = await response.json();

        if (data.success) {
          setIsServerWishlisted(data.isWishlisted);
          toast.success(
            data.isWishlisted
              ? "Added to wishlist"
              : "Removed from wishlist"
          );
        } else {
          toast.error(data.message || "Something went wrong");
        }
      } else {
        const wasAdded = toggleItem(product);
        toast.success(
          wasAdded
            ? "Added to wishlist! Sign in to save permanently"
            : "Removed from wishlist"
        );
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`${sizeClasses[size]} ${className} ${
        isWishlisted 
          ? "bg-red-50 border-red-200 hover:bg-red-100" 
          : "hover:bg-gray-50"
      }`}
      onClick={toggleWishlist}
      disabled={isLoading}
    >
      <Heart
        className={`${iconSizes[size]} ${
          isWishlisted 
            ? "fill-red-500 text-red-500" 
            : "text-gray-400"
        }`}
      />
    </Button>
  );
};

export default WishlistButton;
