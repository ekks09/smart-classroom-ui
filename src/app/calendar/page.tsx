'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

export default function CalendarPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  const canAccess = useMemo(
    () => user?.role === 'teacher' || user?.role === 'admin',
    [user?.role]
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-void-black relative scanlines">
      <Header />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10 pt-24">
        <Card className="glass holographic">
          <CardHeader>
            <CardTitle className="text-neon-cyan flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-electric-blue space-y-2">
            {!canAccess ? (
              <div className="text-warning-purple">
                You don&apos;t have access to this page.
              </div>
            ) : (
              <>
                <div>Calendar UI is ready to be wired once `POST /create-event` exists.</div>
                <div className="opacity-70 text-sm">
                  Next step: add an events endpoint and we’ll implement monthly view + add-event modal + reminders.
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

