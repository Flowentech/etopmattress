"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavigationProps {
  onLinkClick?: () => void;
}

const Navigation = ({ onLinkClick }: NavigationProps) => {
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ];

  const handleClick = () => {
    onLinkClick?.();
  };

  return (
    <nav className="flex flex-col md:flex-row md:space-x-5 space-y-2 md:space-y-0 text-xs pointer-events-auto">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={handleClick}
            className={`pb-1 transition-all border-b-2 relative z-20 cursor-pointer pointer-events-auto inline-block ${
              isActive
                ? "text-primary border-primary font-medium"
                : "border-transparent text-gray-600 hover:text-primary hover:border-primary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
