'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Database, Cpu, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { HealthStatus } from '@/types';
import { FloatingIcons } from '@/components/scholar/FloatingIcons';

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
      title: 'Vector Integrity',
      value: health?.vector_db?.connected ? 'Connected' : 'Disconnected',
      icon: Database,
      color: health?.vector_db?.connected ? 'text-neon-cyan' : 'text-warning-purple',
      description: 'Supabase Vector DB',
    },
    {
      title: 'LLM Status',
      value: health?.llm_ready ? 'Ready' : 'Loading',
      icon: Brain,
      color: health?.llm_ready ? 'text-neon-cyan' : 'text-warning-purple',
      description: 'Qwen 2.5-3B',
    },
    {
      title: 'Speech Engine',
      value: health?.stt_ready ? 'Active' : 'Standby',
      icon: Cpu,
      color: health?.stt_ready ? 'text-neon-cyan' : 'text-warning-purple',
      description: 'Faster Whisper',
    },
  ];

  return (
    <div className="min-h-screen bg-void-black relative scanlines">
      <FloatingIcons />

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neon-cyan/20">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-neon-cyan glow" />
          <h1 className="text-2xl font-bold text-neon-cyan">Scholar's AI</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
            <span className="text-sm text-neon-cyan">System Online</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-neon-cyan mb-8">Mission Control</h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass holographic">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg text-neon-cyan mb-2">
                          {stat.title}
                        </h3>
                        <p className={`text-2xl font-bold ${stat.color} mb-1`}>
                          {stat.value}
                        </p>
                        <p className="text-sm text-electric-blue">
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
              <Card className="glass holographic cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center">
                  <Upload className="w-16 h-16 text-neon-cyan mx-auto mb-4 glow" />
                  <h3 className="text-xl text-neon-cyan mb-2">
                    Upload Knowledge
                  </h3>
                  <p className="text-electric-blue mb-4">
                    Add new lectures and documents to the neural network
                  </p>
                  <Button className="hex bg-void-black border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-void-black px-8 py-3">
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
              <Card className="glass holographic cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center">
                  <Brain className="w-16 h-16 text-neon-cyan mx-auto mb-4 glow" />
                  <h3 className="text-xl text-neon-cyan mb-2">
                    Start Session
                  </h3>
                  <p className="text-electric-blue mb-4">
                    Begin an interactive learning session with the AI
                  </p>
                  <Button className="hex bg-void-black border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-void-black px-8 py-3">
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