'use client';

import React from 'react';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-6 border-b border-cyber-cyan/20 bg-cyber-black/50 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <Brain className="w-8 h-8 text-cyber-cyan glow" />
        <h1 className="text-2xl font-bold text-cyber-cyan">Scholar's AI</h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
          <span className="text-sm text-cyber-cyan">System Online</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <span className="text-cyber-cyan">Welcome, {user.name}</span>
        )}
        <Button variant="neon" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
};