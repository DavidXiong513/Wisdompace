
import React from 'react';
import Link from 'next/link';
import AuthEntry from './AuthEntry';

const NavBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6">
      <nav className="container mx-auto flex items-center justify-between">
        <div>
          {/* Placeholder for logo or site title if needed in the future */}
          <Link href="/" className="text-white text-lg font-bold">
            {/* Wisdompace */}
          </Link>
        </div>
        <AuthEntry />
      </nav>
    </header>
  );
};

export default NavBar;
