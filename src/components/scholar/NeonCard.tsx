'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NeonCardProps extends CardProps {
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
          'holographic data-stream transition-all duration-300 hover:shadow-lg',
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