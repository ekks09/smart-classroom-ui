'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, GraduationCap } from 'lucide-react';

const icons = [Brain, BookOpen, GraduationCap];

export const FloatingIcons: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {icons.map((Icon, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: 0.3,
          }}
          animate={{
            x: [
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            ],
            y: [
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            ],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            filter: 'drop-shadow(0 0 8px #00f5d4)',
          }}
        >
          <Icon className="w-8 h-8 text-neon-cyan animate-float" />
        </motion.div>
      ))}
    </div>
  );
};