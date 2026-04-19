'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NeonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
}

export const NeonCard: React.FC<NeonCardProps> = ({
  className,
  glowColor = '#00f5d4',
  children,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Card
        className={cn(
          'glass holographic border border-neon-cyan/50 hover:border-neon-cyan transition-all duration-300',
          className
        )}
        style={{
          '--glow-color': glowColor,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};