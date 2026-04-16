'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Spline from '@splinetool/react-spline';
import { ScanlineOverlay } from '@/components/scholar/ScanlineOverlay';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(email, password);
      login(response.token, response.user);
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden">
      <ScanlineOverlay />

      {/* Spline Background */}
      <div className="absolute inset-0 z-0">
        <Spline scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" />
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="holographic">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <CardTitle className="text-3xl font-bold text-cyber-cyan mb-2">
                  Airlock Access
                </CardTitle>
                <p className="text-cyber-blue">
                  Enter the Neural Network
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Input
                    type="email"
                    placeholder="Neural ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Access Code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {error && (
                  <p className="text-cyber-purple text-sm text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="neon"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Initialize Session'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-cyber-blue">
                  System Status: Online
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}