'use client'; 

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Form from "next/form";
import { Menu, X } from "lucide-react";
import { SignInButton, ClerkLoaded } from "@clerk/nextjs";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";

import Container from "../Container";
import CartIcon from "../CartIcon";
import Navigation from ".";
import { logo } from "@/public/images";

type HeaderContentProps = {
  user: any;
};

const HeaderContent: React.FC<HeaderContentProps> = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <Container>
          <header className="flex items-center justify-between py-2 h-16">
            {/* Left Side - Mobile Menu, Logo & Interio AI */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button onClick={toggleSidebar} className="lg:hidden text-gray-700 mr-3">
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <Image src={logo} alt="logo" className="w-16 lg:w-20 h-auto" priority />
              </Link>
            </div>

            {/* Center - Search (Desktop only) */}
            <div className="hidden lg:flex flex-1 max-w-sm mx-6">
              <Form action="/search" className="w-full">
                <input
                  type="text"
                  name="query"
                  placeholder="Search products..."
                  className="bg-gray-50 text-gray-800 px-3 py-2 border border-gray-200 w-full rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </Form>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-1">
              {/* Wishlist Icon */}
              <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
              
              <CartIcon />
              
              {/* User Auth */}
               <ClerkLoaded>
                {user ? (
                  <UserMenu />
                ) : (
                  <SignInButton mode="modal">
                    <Button className="bg-primary hover:bg-primary/90 text-white text-sm px-3 py-1.5 h-8">
                      Sign In
                    </Button>
                  </SignInButton>
                )}
              </ClerkLoaded>
            </div>
          </header>

          {/* Navigation (desktop) */}
          <div className="hidden lg:block border-t border-gray-100 py-2 relative z-10">
            <div className="flex justify-center items-center pointer-events-auto">
              <Navigation />
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Sidebar panel */}
          <div className="bg-white w-64 h-full shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={toggleSidebar}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <Navigation onLinkClick={toggleSidebar} />

            {/* Mobile Search */}
            <div className="lg:hidden mb-4">
              <Form action="/search" className="w-full">
                <input
                  type="text"
                  name="query"
                  placeholder="Search for products"
                  className="bg-gray-50 text-gray-800 px-4 py-2.5 border border-gray-200 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </Form>
            </div>

            {/* Mobile User Section */}
            <div className="flex lg:hidden items-center justify-between pt-4 border-t border-gray-200">
              <ClerkLoaded>
                {user ? (
                  <div className="flex items-center gap-3">
                    <UserMenu />
                    <div className="text-sm">
                      <p className="text-gray-500">Welcome back</p>
                      <p className="font-medium text-gray-900 truncate max-w-[120px]">
                        {user.fullName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      Sign In
                    </Button>
                  </SignInButton>
                )}
              </ClerkLoaded>
            </div>
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/50" onClick={toggleSidebar} />
        </div>
      )}
    </>
  );
};

export default HeaderContent;
