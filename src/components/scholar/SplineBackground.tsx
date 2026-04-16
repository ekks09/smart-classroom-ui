'use client';

import React from 'react';
import Spline from '@splinetool/react-spline';

interface SplineBackgroundProps {
  scene: string;
  className?: string;
}

export const SplineBackground: React.FC<SplineBackgroundProps> = ({
  scene,
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 z-0 ${className}`}>
      <Spline scene={scene} />
    </div>
  );
};