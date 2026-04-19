'use client';

import React from 'react';

export const ScanlineOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none scanlines z-10" />
  );
};