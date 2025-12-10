import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      background: '#020617',
      borderBottom: '1px solid #1f2937',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        gap: 8,
      }}>
        <Link
          to="/"
          style={{
            padding: '16px 20px',
            textDecoration: 'none',
            color: isActive('/') ? '#38bdf8' : '#e5e7eb',
            borderBottom: isActive('/') ? '2px solid #38bdf8' : '2px solid transparent',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          Create Invoice
        </Link>
        <Link
          to="/dashboard"
          style={{
            padding: '16px 20px',
            textDecoration: 'none',
            color: isActive('/dashboard') ? '#38bdf8' : '#e5e7eb',
            borderBottom: isActive('/dashboard') ? '2px solid #38bdf8' : '2px solid transparent',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          Dashboard
        </Link>
        <Link
          to="/preview"
          style={{
            padding: '16px 20px',
            textDecoration: 'none',
            color: isActive('/preview') ? '#38bdf8' : '#e5e7eb',
            borderBottom: isActive('/preview') ? '2px solid #38bdf8' : '2px solid transparent',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          Preview
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
