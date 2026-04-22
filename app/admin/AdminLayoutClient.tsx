'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="admin-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' });
  };

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <div className="admin-user">
          <span>{session.user?.email}</span>
          <button onClick={handleLogout} className="admin-logout">
            Logout
          </button>
        </div>
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">{children}</div>
    </div>
  );
}
