'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const GlitchLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          x: [0, -2, 2, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="text-4xl font-bold text-cyber-cyan">
          LOADING
        </div>
        <motion.div
          className="absolute inset-0 text-4xl font-bold text-cyber-purple opacity-50"
          animate={{
            x: [0, 2, -2, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.1,
          }}
        >
          LOADING
        </motion.div>
      </motion.div>
    </div>
  );
};