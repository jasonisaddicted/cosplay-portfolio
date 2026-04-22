'use client';

import Link from 'next/link';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
      </div>

      {/* Admin Sidebar Navigation */}
      <div className="admin-nav">
        <nav className="admin-nav__menu">
          <Link href="/admin" className="admin-nav__link">
            Dashboard
          </Link>
          <Link href="/admin/events" className="admin-nav__link">
            Events
          </Link>
          <Link href="/admin/studio" className="admin-nav__link">
            Studio
          </Link>
          <Link href="/admin/outdoor" className="admin-nav__link">
            Outdoor
          </Link>
          <Link href="/admin/collabs" className="admin-nav__link">
            Collabs
          </Link>
          <Link href="/admin/settings" className="admin-nav__link">
            Settings
          </Link>
          <Link href="/admin/photos" className="admin-nav__link">
            Photos
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">{children}</div>
    </div>
  );
}
