'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-void-black relative overflow-hidden scanlines flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <Card className="glass holographic border border-neon-cyan/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neon-cyan mb-2">{title}</h1>
              <p className="text-electric-blue">{subtitle}</p>
            </div>

            {children}

            {footer && (
              <div className="mt-8 text-center text-xs text-electric-blue">
                {footer}
              </div>
            )}

            <div className="mt-6 text-center text-xs text-electric-blue">
              <Link href="/" className="text-neon-cyan underline">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
