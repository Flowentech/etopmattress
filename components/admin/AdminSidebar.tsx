'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Settings,
  Tag,
  UserCheck,
  Truck,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Ruler,
  Maximize
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Categories', href: '/admin/categories', icon: Tag },
  { name: 'Sizes', href: '/admin/sizes', icon: Maximize },
  { name: 'Heights', href: '/admin/heights', icon: Ruler },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Employees', href: '/admin/employees', icon: UserCheck },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Delivery', href: '/admin/delivery', icon: Truck },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const contentNavigation = [
  { name: 'Blogs', href: '/admin/blogs', icon: FileText },
  { name: 'Blog Categories', href: '/admin/blog-categories', icon: Tag },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Gallery Categories', href: '/admin/gallery-categories', icon: Tag },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isContentOpen, setIsContentOpen] = useState(() => {
    // Keep content section open if any content page is active
    return contentNavigation.some(item => pathname === item.href);
  });

  const isContentActive = contentNavigation.some(item => pathname === item.href);

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500">Etopmattress</p>
      </div>

      <nav className="mt-6">
        {/* Main Navigation */}
        <div className="mb-6">
          <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Main
          </h3>
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white border-r-2 border-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Content Management Section */}
        <div className="mb-6">
          <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Content Management
          </h3>

          {/* Content Section Header */}
          <button
            onClick={() => setIsContentOpen(!isContentOpen)}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              isContentActive
                ? 'bg-primary text-white border-r-2 border-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FolderOpen className="mr-3 h-5 w-5" />
            <span className="flex-1 text-left">Content</span>
            {isContentOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Content Sub-items */}
          {isContentOpen && (
            <div className="bg-gray-50">
              {contentNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-12 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white border-r-2 border-primary'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}