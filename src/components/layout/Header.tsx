'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Brain, Calendar, CalendarDays, Database, MessageSquare, Mic, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const role = user?.role;
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Database, roles: ['teacher', 'student', 'admin'] },
    { href: '/ask-ai', label: 'Ask AI', icon: Brain, roles: ['teacher', 'student', 'admin'] },
    { href: '/chat', label: 'Chat', icon: MessageSquare, roles: ['teacher', 'student', 'admin'] },
    { href: '/live', label: 'Live', icon: Mic, roles: ['teacher', 'student', 'admin'] },
    { href: '/semester', label: 'Semester', icon: Calendar, roles: ['teacher', 'admin'] },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays, roles: ['teacher', 'admin'] },
    { href: '/attendance', label: 'Attendance', icon: Users, roles: ['teacher', 'admin'] },
    { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['teacher', 'admin'] },
  ].filter((item) => !role || item.roles.includes(role));

  return (
    <header className="flex items-center justify-between p-6 border-b border-cyber-cyan/20 bg-cyber-black/50 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-cyber-cyan glow" />
          <h1 className="text-2xl font-bold text-cyber-cyan">Scholar&apos;s AI</h1>
        </Link>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
          <span className="text-sm text-cyber-cyan">System Online</span>
        </div>
      </div>

      <nav className="flex items-center space-x-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "neon" : "ghost"}
                className="flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-2 text-cyber-cyan">
            <User className="w-4 h-4" />
            <span>{user.username} ({user.role})</span>
          </div>
        )}
        <Button variant="neon" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
};
