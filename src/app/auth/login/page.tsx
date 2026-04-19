'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/lib/config';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  // Only redirect if we're already authenticated and haven't just logged in
  useEffect(() => {
    if (isAuthenticated && !redirected && !authLoading) {
      setRedirected(true);
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, redirected, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      setLoading(false);
      // Don't navigate here - let the useEffect handle it
      // This prevents race conditions
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      console.error('❌ Login error:', errorMsg);
      setError(errorMsg);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <AuthLayout
        title="Initializing..."
        subtitle="Connecting to the Neural Network"
        footer={<p className="text-xs text-electric-blue">System Status: Booting...</p>}
      >
        <div className="text-center">
          <div className="animate-pulse text-neon-cyan">⚡ Establishing connection...</div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Airlock Access"
      subtitle="Enter the Neural Network"
      footer={
        <div className="space-y-2 text-xs text-electric-blue">
          <p>System Status: Online</p>
          <p>
            Demo teacher login:{' '}
            <span className="font-semibold text-neon-cyan">{config.demo.username} / {config.demo.password}</span>
          </p>
          <p className="text-warning-purple">
            ⚠️ Password is case-sensitive — copy the credentials exactly above.
          </p>
          <p>
            Need a new account?{' '}
            <Link href="/auth/register" className="text-neon-cyan underline">
              Create one here
            </Link>
          </p>
          <p>
            <Link href="/auth/forgot-password" className="text-neon-cyan underline">
              Forgot password?
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            className="w-full bg-transparent border-0 border-b-2 border-neon-cyan text-neon-cyan placeholder-neon-cyan/50 focus:ring-0 focus:border-neon-cyan disabled:opacity-50"
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Access Code"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="w-full bg-transparent border-0 border-b-2 border-neon-cyan text-neon-cyan placeholder-neon-cyan/50 focus:ring-0 focus:border-neon-cyan disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="p-3 bg-warning-purple/20 border border-warning-purple rounded">
            <p className="text-warning-purple text-sm">{error}</p>
            {error.includes('Unable to connect') && (
              <p className="text-warning-purple/80 text-xs mt-2">
                💡 Tip: Make sure your backend is running and NEXT_PUBLIC_API_URL is set correctly
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-void-black font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || authLoading}
        >
          {loading ? '🔐 Authenticating...' : '⚡ Initialize Session'}
        </Button>
      </form>
    </AuthLayout>
  );
}