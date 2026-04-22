'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { getSiteConfig } from '@/lib/firebase/firestore';
import type { SiteConfig } from '@/lib/firebase/firestore';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getSiteConfig();
        setConfig(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) return <div className="admin-page"><p>Loading settings...</p></div>;

  return (
    <div className="admin-page">
      <h1 style={{ margin: '0 0 24px 0' }}>Site Settings</h1>

      <div style={{ background: '#111111', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Current Configuration</h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>Brand Name</label>
          <input
            type="text"
            defaultValue={config?.brandName || 'Cosplay Portfolio'}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '4px',
              color: 'var(--text)',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
            }}
            disabled
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>Instagram Handle</label>
          <input
            type="text"
            defaultValue={config?.instagram || '@cosplay_portfolio'}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '4px',
              color: 'var(--text)',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
            }}
            disabled
          />
        </div>

        <div style={{ padding: '16px', background: '#1a1a1a', borderRadius: '4px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>OG Images:</strong> Configure custom Open Graph images for social sharing
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Events: {config?.ogImages?.events ? '✓ Set' : '— Not set'}</li>
            <li>Studio: {config?.ogImages?.studio ? '✓ Set' : '— Not set'}</li>
            <li>Outdoor: {config?.ogImages?.outdoor ? '✓ Set' : '— Not set'}</li>
            <li>Collabs: {config?.ogImages?.collabs ? '✓ Set' : '— Not set'}</li>
            <li>Home: {config?.ogImages?.home ? '✓ Set' : '— Not set'}</li>
          </ul>
        </div>
      </div>

      <div style={{ padding: '20px', background: '#111111', border: '1px solid #2a2a2a', borderRadius: '4px', color: 'var(--text-light)' }}>
        <p>
          <strong>📝 Note:</strong> Full settings editor with save functionality coming in Phase 2. This page shows your current site configuration stored in Firestore.
        </p>
      </div>
    </div>
  );
}
