'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Interio</span>
                <span className="text-xl font-bold text-emerald-600">Wale</span>
              </div>
            </Link>
          </div>

          {/* Center - Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                window.location.pathname === '/' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                window.location.pathname === '/shop' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
            >
              Shop
            </Link>
            <Link
              href="/stores"
              className={`text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                window.location.pathname === '/stores' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
            >
              All Stores
            </Link>
            <Link
              href="/find-architects"
              className={`text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                window.location.pathname === '/architecture' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
            >
              Find Architects
            </Link>
            <Link
              href="/gallery"
              className={`text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                window.location.pathname === '/gallery' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
            >
              Gallery
            </Link>
            <Link
              href="/tips"
              className={`text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                window.location.pathname === '/tips' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
            >
              Blogs
            </Link>
          </nav>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/user?tab=orders">
                <Button variant="outline" size="sm">
                  My Orders
                </Button>
              </Link>
            </div>

            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <SheetTitle>Menu</SheetTitle>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-md opacity-70 hover:opacity-100 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col space-y-3">
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link
                    href="/stores"
                    className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    All Stores
                  </Link>
                  <Link
                    href="/find-architects"
                    className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Find Architects
                  </Link>
                  <Link
                    href="/gallery"
                    className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Gallery
                  </Link>
                  <Link
                    href="/tips"
                    className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Blogs
                  </Link>
                </nav>

                {user && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center space-x-3 px-3">
                      <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/dashboard/user?tab=orders">
                        <Button variant="outline" size="sm" className="w-full">
                          My Orders
                        </Button>
                      </Link>
                    </div>

                    <Link
                      href="/sign-out"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium w-full text-center transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Out
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;