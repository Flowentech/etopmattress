'use client';

import { UserButton } from '@clerk/nextjs';
import { User, LayoutDashboard, ShoppingBag, Building2 } from 'lucide-react';

const UserMenu = () => {
  return (
    <div className="flex items-center">
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10 rounded-full border-2 border-emerald-500",
            userButtonPopoverCard: "shadow-lg",
            userButtonPopoverActionButton: "hover:bg-gray-50",
          },
        }}
        userProfileMode="modal"
        userProfileUrl="/dashboard/user"
      >
        <UserButton.MenuItems>
          <UserButton.Link
            label="Dashboard"
            labelIcon={<LayoutDashboard size={16} />}
            href="/dashboard/user"
          />
          <UserButton.Link
            label="My Orders"
            labelIcon={<ShoppingBag size={16} />}
            href="/dashboard/user?tab=orders"
          />
          <UserButton.Link
            label="Find Architect"
            labelIcon={<Building2 size={16} />}
            href="/find-architects"
          />
          <UserButton.Action label="manageAccount" />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
};

export default UserMenu;