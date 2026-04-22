'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="nav scrolled">
      <Link href="/" className="nav__brand" onClick={closeMenu}>
        Cosplay Portfolio
      </Link>
      <button
        className="nav__hamburger"
        id="nav-hamburger"
        aria-label="Menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
      >
        <svg className="nav__hamburger-icon" viewBox="0 0 24 24" width="24" height="24">
          <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="18" x2="21" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <svg className="nav__hamburger-close" viewBox="0 0 24 24" width="24" height="24">
          <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <ul className={`nav__links ${isOpen ? 'active' : ''}`}>
        <li>
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/events" onClick={closeMenu}>
            Events
          </Link>
        </li>
        <li>
          <Link href="/outdoor" onClick={closeMenu}>
            Outdoor
          </Link>
        </li>
        <li>
          <Link href="/studio" onClick={closeMenu}>
            Studio
          </Link>
        </li>
        <li>
          <Link href="/collabs" onClick={closeMenu}>
            Collabs
          </Link>
        </li>
      </ul>
    </nav>
  );
}
