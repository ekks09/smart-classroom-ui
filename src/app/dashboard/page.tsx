'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Database, Cpu, Upload } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { HealthStatus } from '@/types';
import { Header } from '@/components/layout/Header';
import { FloatingIcons } from '@/components/scholar/FloatingIcons';
import { ScanlineOverlay } from '@/components/scholar/ScanlineOverlay';

export default function DashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    fetchHealth();
  }, [isAuthenticated, router]);

  const fetchHealth = async () => {
    try {
      const healthData = await api.getHealth();
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: 'Neural Capacity',
      value: '1.2 TB',
      icon: Database,
      color: 'text-cyber-cyan',
      description: 'Indexed Knowledge',
    },
    {
      title: 'Vector Integrity',
      value: health?.vector_db ? 'Optimal' : 'Degraded',
      icon: Brain,
      color: health?.vector_db ? 'text-cyber-cyan' : 'text-cyber-purple',
      description: 'Database Status',
    },
    {
      title: 'Compute Load',
      value: health?.llm_ready ? 'Active' : 'Standby',
      icon: Cpu,
      color: health?.llm_ready ? 'text-cyber-cyan' : 'text-cyber-purple',
      description: 'LLM Status',
    },
  ];

  return (
    <div className="min-h-screen bg-cyber-black relative">
      <ScanlineOverlay />
      <FloatingIcons />

      <Header />

      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-cyber-cyan mb-8">Mission Control</h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="holographic">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-cyber-cyan mb-2">
                          {stat.title}
                        </CardTitle>
                        <p className={`text-2xl font-bold ${stat.color} mb-1`}>
                          {stat.value}
                        </p>
                        <p className="text-sm text-cyber-blue">
                          {stat.description}
                        </p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color} glow`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="holographic cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center">
                  <Upload className="w-16 h-16 text-cyber-cyan mx-auto mb-4 glow" />
                  <CardTitle className="text-xl text-cyber-cyan mb-2">
                    Upload Knowledge
                  </CardTitle>
                  <p className="text-cyber-blue mb-4">
                    Add new lectures and documents to the neural network
                  </p>
                  <Button variant="neon" size="lg">
                    Start Upload
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => router.push('/chat')}
            >
              <Card className="holographic cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center">
                  <Brain className="w-16 h-16 text-cyber-cyan mx-auto mb-4 glow" />
                  <CardTitle className="text-xl text-cyber-cyan mb-2">
                    Start Session
                  </CardTitle>
                  <p className="text-cyber-blue mb-4">
                    Begin an interactive learning session with the AI
                  </p>
                  <Button variant="neon" size="lg">
                    Enter Neural Net
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}