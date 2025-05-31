import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, isActive, children, className = '' }) => {
  return (
    <Link
      to={to}
      className={`${className} px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-neutral-light hover:text-white hover:bg-primary-dark/20'
      }`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
