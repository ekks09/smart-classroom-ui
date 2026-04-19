'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(username, password, email, role);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void-black relative overflow-hidden scanlines">
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
                <h1 className="text-3xl font-bold text-neon-cyan mb-2">Register</h1>
                <p className="text-electric-blue">
                  Create a new instructor or student account.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
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
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-neon-cyan text-neon-cyan placeholder-neon-cyan/50 focus:ring-0 focus:border-neon-cyan"
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent border-0 border-b-2 border-neon-cyan text-neon-cyan placeholder-neon-cyan/50 focus:ring-0 focus:border-neon-cyan"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm text-electric-blue">
                    <span className="mr-2">Role</span>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'teacher' | 'student')}
                      className="bg-void-black border border-neon-cyan/40 rounded px-2 py-2 text-neon-cyan"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </label>
                </div>

                {error && (
                  <p className="text-warning-purple text-sm text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-void-black font-bold py-3 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-electric-blue">
                  Already registered?{' '}
                  <Link href="/" className="text-neon-cyan underline">
                    Sign in here.
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
