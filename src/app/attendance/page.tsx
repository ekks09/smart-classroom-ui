'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useAudioStream } from '@/hooks/useAudioStream';

export default function AttendancePage() {
  const router = useRouter();
  const { isAuthenticated, loading, user, token } = useAuth();
  const { attendance, liveSession, isConnected, isRecording } = useAudioStream(token);

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

  const activeSessionId = liveSession?.session_id;

  return (
    <div className="min-h-screen bg-void-black relative scanlines">
      <Header />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10 pt-24">
        <Card className="glass holographic">
          <CardHeader className="space-y-2">
            <CardTitle className="text-neon-cyan flex items-center gap-2">
              <Users className="h-5 w-5" />
              Attendance
            </CardTitle>
            <div className="text-sm text-electric-blue">
              Socket: {isConnected ? 'Connected' : 'Disconnected'} • Stream:{' '}
              {isRecording ? 'Active' : 'Idle'}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!canAccess ? (
              <div className="text-warning-purple">
                You don&apos;t have access to this page.
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-neon-cyan/20 bg-transparent p-4">
                  <div className="text-neon-cyan font-semibold">
                    Active session: {activeSessionId || 'None'}
                  </div>
                  <div className="mt-2 text-electric-blue">
                    Present students: <span className="text-neon-cyan">{attendance.length}</span>
                  </div>
                </div>

                {attendance.length === 0 ? (
                  <div className="text-sm text-electric-blue opacity-70">
                    No attendance data yet. Students must join the live session.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {attendance.map((studentId) => (
                      <div
                        key={studentId}
                        className="rounded-lg border border-neon-cyan/20 bg-transparent p-3 text-electric-blue"
                      >
                        {studentId}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
