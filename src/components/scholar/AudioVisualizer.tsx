'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isActive: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Outer ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isActive ? '#00f5d4' : '#00f5d4aa';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing inner circles
      if (isActive) {
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius - i * 15, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(0, 245, 212, ${0.5 / i})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = isActive ? '#00f5d4' : '#00f5d4aa';
      ctx.fill();
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    animate();
  }, [isActive]);

  return (
    <motion.div
      className="flex items-center justify-center"
      animate={isActive ? { scale: 1.1 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="rounded-full"
      />
    </motion.div>
  );
};