'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TerminalTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export const TerminalText: React.FC<TerminalTextProps> = ({
  text,
  speed = 30,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`font-mono text-neon-cyan ${className}`}
    >
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </motion.div>
  );
};