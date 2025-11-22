import Link from "next/link";
import React from "react";
import Container from "./Container";
import Image from "next/image";
import { logo, payment } from "@/public/images";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Image src={logo} alt="logo" width={300} height={200} className="w-24 h-20" />
            </div>
            <p className="text-white mb-4 max-w-md">
              Experience the perfect night's sleep with our premium collection of mattresses.
              Quality comfort, exceptional support, and unbeatable value for better rest.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="/faqs"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-sm border-t border-gray-800 mt-8 pt-8 text-center text-white">
          <Container className="py-5">
            <footer className="flex  lg:flex flex-col space-y-2 items-center justify-between">
              <p className="text-white">
                Copyright © 2025{" "}
                <span className="font-semibold">Etopmattress</span>{" "}
                all rights reserved.
              </p>
              <Image
                src={payment}
                alt="payment"
                className="w-64 object-cover"
              />
            </footer>
          </Container>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
