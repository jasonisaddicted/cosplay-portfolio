'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Metadata } from 'next';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const errorCode = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/admin');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <div className="admin-login__card">
          <h1 className="admin-login__title">Admin Panel</h1>
          <p className="admin-login__subtitle">Cosplay Portfolio Management</p>

          {errorCode && (
            <div className="admin-login__error">
              <p>Authentication failed. Please check your credentials.</p>
            </div>
          )}

          {error && (
            <div className="admin-login__error">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login__form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <button type="submit" className="form-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="admin-login__footer">
            Enter your Firebase email and password to access the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
