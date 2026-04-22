'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAlbumsByType } from '@/lib/firebase/firestore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    events: 0,
    studio: 0,
    outdoor: 0,
    collabs: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const types = ['events', 'studio', 'outdoor', 'collabs'] as const;
        const newStats = { events: 0, studio: 0, outdoor: 0, collabs: 0, total: 0 };

        for (const type of types) {
          const albums = await getAlbumsByType(type);
          newStats[type] = albums.length;
          newStats.total += albums.length;
        }

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard__title">Dashboard</h1>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="admin-dashboard__grid">
            <div className="admin-stat">
              <p className="admin-stat__label">Total Albums</p>
              <p className="admin-stat__value">{stats.total}</p>
            </div>
            <div className="admin-stat">
              <p className="admin-stat__label">Events</p>
              <p className="admin-stat__value">{stats.events}</p>
            </div>
            <div className="admin-stat">
              <p className="admin-stat__label">Studio</p>
              <p className="admin-stat__value">{stats.studio}</p>
            </div>
            <div className="admin-stat">
              <p className="admin-stat__label">Outdoor</p>
              <p className="admin-stat__value">{stats.outdoor}</p>
            </div>
            <div className="admin-stat">
              <p className="admin-stat__label">Collabs</p>
              <p className="admin-stat__value">{stats.collabs}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.3rem' }}>Quick Actions</h2>
            <div className="admin-grid">
              <div className="admin-card">
                <h3 className="admin-card__title">Manage Events</h3>
                <p className="admin-card__description">Create, edit, and organize event albums</p>
                <Link href="/admin/events" className="admin-card__button">
                  Go to Events
                </Link>
              </div>
              <div className="admin-card">
                <h3 className="admin-card__title">Manage Studio</h3>
                <p className="admin-card__description">Manage studio photography sessions</p>
                <Link href="/admin/studio" className="admin-card__button">
                  Go to Studio
                </Link>
              </div>
              <div className="admin-card">
                <h3 className="admin-card__title">Manage Outdoor</h3>
                <p className="admin-card__description">Organize outdoor and location shoots</p>
                <Link href="/admin/outdoor" className="admin-card__button">
                  Go to Outdoor
                </Link>
              </div>
              <div className="admin-card">
                <h3 className="admin-card__title">Manage Collabs</h3>
                <p className="admin-card__description">Handle collaboration projects</p>
                <Link href="/admin/collabs" className="admin-card__button">
                  Go to Collabs
                </Link>
              </div>
              <div className="admin-card">
                <h3 className="admin-card__title">Site Settings</h3>
                <p className="admin-card__description">Configure site-wide settings</p>
                <Link href="/admin/settings" className="admin-card__button">
                  Go to Settings
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
