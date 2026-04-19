'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Mic, Settings } from 'lucide-react';

export const FloatingOrbs: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const satellites = [
    { icon: Upload, label: 'Upload', action: () => console.log('Upload clicked') },
    { icon: Mic, label: 'Voice', action: () => console.log('Voice clicked') },
    { icon: Settings, label: 'Settings', action: () => console.log('Settings clicked') },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        className="relative"
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
      >
        {/* Main Orb */}
        <motion.div
          animate={{ scale: isExpanded ? 1.1 : 1 }}
          className="w-16 h-16 bg-neon-cyan rounded-full flex items-center justify-center cursor-pointer shadow-lg glow"
        >
          <div className="w-8 h-8 bg-void-black rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-neon-cyan rounded-full animate-pulse"></div>
          </div>
        </motion.div>

        {/* Satellite Buttons */}
        {satellites.map((satellite, index) => {
          const angle = -60 + (index * 60); // Semi-circle from -60 to 60 degrees
          const radius = 80;

          return (
            <motion.div
              key={satellite.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isExpanded ? 1 : 0,
                opacity: isExpanded ? 1 : 0,
                x: isExpanded ? Math.cos((angle * Math.PI) / 180) * radius : 0,
                y: isExpanded ? -Math.sin((angle * Math.PI) / 180) * radius : 0,
              }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
              className="absolute top-0 left-0"
            >
              <button
                className="w-12 h-12 bg-void-black border border-neon-cyan hex flex items-center justify-center text-neon-cyan hover:bg-neon-cyan hover:text-void-black transition-colors"
                onClick={satellite.action}
              >
                <satellite.icon className="w-5 h-5" />
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};