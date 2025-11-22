
import React from 'react';

import { currentUser } from '@clerk/nextjs/server';
import HeaderContent from './header-content';

const Header = async () => {
  const user = await currentUser();

  // Convert the Clerk user to a plain object
  const safeUser = user
    ? {
        id: user.id,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        fullName: user.firstName || user.lastName
          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
          : user.username ?? 'User',
        email: user.emailAddresses?.[0]?.emailAddress ?? null,
        imageUrl: user.imageUrl ?? null,
        username: user.username ?? null,
      }
    : null;

  return <HeaderContent user={safeUser} />;
};

export default Header;
