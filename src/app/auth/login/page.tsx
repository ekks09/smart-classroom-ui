'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Airlock Access"
      subtitle="Enter the Neural Network"
      footer={
        <div className="space-y-2 text-xs text-electric-blue">
          <p>System Status: Online</p>
          <p>
            Demo teacher login:{' '}
            <span className="font-semibold text-neon-cyan">teacher / password123</span>
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
            required
            className="w-full bg-transparent border-0 border-b-2 border-neon-cyan text-neon-cyan placeholder-neon-cyan/50 focus:ring-0 focus:border-neon-cyan"
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Access Code"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border-0 border-b-2 border-neon-cyan text-neon-cyan placeholder-neon-cyan/50 focus:ring-0 focus:border-neon-cyan"
          />
        </div>

        {error && (
          <p className="text-warning-purple text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-void-black font-bold py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Initialize Session'}
        </Button>
      </form>
    </AuthLayout>
  );
}