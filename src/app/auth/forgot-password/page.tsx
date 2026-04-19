'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await api.requestPasswordReset(email);
      setMessage(result.message || 'If this email exists, reset instructions were sent.');
    } catch (err: any) {
      setError(err.message || 'Unable to submit password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your account email to receive a reset link."
      footer={
        <p>
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-neon-cyan underline">
            Sign in instead.
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border-0 border-b-2 border-neon-cyan text-neon-cyan placeholder-neon-cyan/50 focus:ring-0 focus:border-neon-cyan"
          />
        </div>

        {message && <p className="text-neon-cyan text-sm">{message}</p>}
        {error && <p className="text-warning-purple text-sm">{error}</p>}

        <Button type="submit" className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-void-black py-3 rounded-lg" disabled={loading}>
          {loading ? 'Submitting...' : 'Send reset link'}
        </Button>
      </form>
    </AuthLayout>
  );
}