'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
// import dynamic from 'next/dynamic';

// const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });

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
    <div className="min-h-screen bg-void-black relative overflow-hidden scanlines">
      {/* Spline Background - Temporarily disabled for build */}
      {/* <div className="absolute inset-0 z-0">
        <Spline scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" />
      </div> */}

      {/* Login Form - Airlock */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass holographic">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-neon-cyan mb-2">
                  Airlock Access
                </h1>
                <p className="text-electric-blue">
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
                  <p className="text-warning-purple text-sm text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-void-black font-bold py-3 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Initialize Session'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-electric-blue">
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