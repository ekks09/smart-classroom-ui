'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Mic, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FloatingOrbs: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const orbVariants = {
    collapsed: { scale: 1 },
    expanded: { scale: 1.1 },
  };

  const satelliteVariants = {
    collapsed: { scale: 0, opacity: 0 },
    expanded: { scale: 1, opacity: 1 },
  };

  const satellites = [
    { icon: Upload, label: 'Upload', action: () => console.log('Upload clicked') },
    { icon: Mic, label: 'Voice', action: () => console.log('Voice clicked') },
    { icon: Settings, label: 'Settings', action: () => console.log('Settings clicked') },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        className="relative"
        animate={isExpanded ? 'expanded' : 'collapsed'}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
      >
        {/* Main Orb */}
        <motion.div
          variants={orbVariants}
          className="w-16 h-16 bg-cyber-cyan rounded-full flex items-center justify-center cursor-pointer shadow-lg glow"
        >
          <div className="w-8 h-8 bg-cyber-black rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-cyber-cyan rounded-full animate-pulse"></div>
          </div>
        </motion.div>

        {/* Satellite Buttons */}
        {satellites.map((satellite, index) => {
          const angle = (index * 360) / satellites.length;
          const radius = 80;

          return (
            <motion.div
              key={satellite.label}
              variants={satelliteVariants}
              className="absolute"
              style={{
                top: `${-Math.sin((angle * Math.PI) / 180) * radius}px`,
                left: `${Math.cos((angle * Math.PI) / 180) * radius}px`,
              }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="neon"
                size="icon"
                className="w-12 h-12"
                onClick={satellite.action}
              >
                <satellite.icon className="w-5 h-5" />
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};