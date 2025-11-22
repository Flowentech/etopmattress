"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Navigation = () => {
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ];

  return (
    <nav className="flex flex-col md:flex-row md:space-x-5 space-y-2 md:space-y-0 text-xs">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`pb-1 transition-all border-b-2 ${
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
