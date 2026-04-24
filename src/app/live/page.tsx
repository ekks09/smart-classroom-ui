'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, Mic, MicOff, UserPlus, Wifi, WifiOff } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AttendanceList } from '@/components/classroom/AttendanceList';
import { AskPanel } from '@/components/classroom/AskPanel';
import { TranscriptFeed } from '@/components/classroom/TranscriptFeed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AudioVisualizer } from '@/components/scholar/AudioVisualizer';
import { FloatingIcons } from '@/components/scholar/FloatingIcons';
import { useAuth } from '@/hooks/useAuth';
import { useAudioStream } from '@/hooks/useAudioStream';

export default function LivePage() {
  const router = useRouter();
  const { isAuthenticated, loading, user, token } = useAuth();
  const {
    isRecording,
    isConnected,
    liveSession,
    transcripts,
    attendance,
    startRecording,
    stopRecording,
    joinLiveSession,
  } = useAudioStream(token);

  const [sessionTitle, setSessionTitle] = useState('Live Lecture');
  const [course, setCourse] = useState('General');
  const [joined, setJoined] = useState(false);

  const canStream = useMemo(
    () => user?.role === 'teacher' || user?.role === 'admin',
    [user?.role]
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleStartRecording = async () => {
    try {
      await startRecording(sessionTitle, course);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleJoin = () => {
    if (!user) return;
    joinLiveSession({ studentId: user.id, sessionId: liveSession?.session_id });
    setJoined(true);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-void-black relative scanlines">
      <Header />
      <FloatingIcons />

      <div className="relative z-10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neon-cyan">Live Classroom</h1>
            <div className="mt-1 text-sm text-electric-blue">
              Session: {liveSession?.session_id || '—'} • Stream:{' '}
              {isRecording ? 'Active' : 'Idle'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                isConnected
                  ? 'border-neon-cyan/40 text-neon-cyan'
                  : 'border-warning-purple/40 text-warning-purple'
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  Disconnected
                </>
              )}
            </div>
          </div>
        </div>

        {canStream ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="glass holographic lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Teacher Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="Session title"
                    className="bg-transparent border-neon-cyan/50 text-neon-cyan"
                  />
                  <Input
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Course"
                    className="bg-transparent border-neon-cyan/50 text-neon-cyan"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-neon-cyan/20 bg-black/20 p-4">
                    <div className="text-sm text-electric-blue mb-3">
                      Microphone Stream
                    </div>
                    <AudioVisualizer isActive={isRecording} />
                    <div className="mt-4">
                      <Button
                        className={`w-full ${
                          isRecording
                            ? 'bg-warning-purple hover:bg-warning-purple/80'
                            : 'bg-neon-cyan hover:bg-neon-cyan/80'
                        } text-void-black`}
                        size="lg"
                        onClick={isRecording ? stopRecording : handleStartRecording}
                        disabled={!isConnected}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-5 h-5 mr-2" />
                            Stop Stream
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-2" />
                            Start Stream
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-neon-cyan/20 bg-black/20 p-4">
                    <div className="text-sm text-electric-blue mb-3">
                      Live Transcript
                    </div>
                    <TranscriptFeed transcripts={transcripts} className="h-72 pr-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass holographic">
                <CardContent className="p-5">
                  <AttendanceList attendance={attendance} />
                </CardContent>
              </Card>

              <Card className="glass holographic">
                <CardContent className="p-5 space-y-3">
                  <div className="text-neon-cyan font-semibold">Post Lecture</div>
                  <div className="text-sm text-electric-blue">
                    Analytics endpoint is marked “future” in your backend spec.
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
                    onClick={() => router.push('/analytics')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Open Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="glass holographic lg:col-span-3">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-neon-cyan">Student View</CardTitle>
                  <Button
                    type="button"
                    onClick={handleJoin}
                    disabled={!isConnected || joined}
                    className="flex items-center"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {joined ? 'Joined' : 'Join Live Session'}
                  </Button>
                </div>
                <div className="text-sm text-electric-blue">
                  When you join, attendance is marked and transcript updates stream in real-time.
                </div>
              </CardHeader>
              <CardContent>
                <TranscriptFeed transcripts={transcripts} className="h-[60vh] pr-1" />
              </CardContent>
            </Card>

            <div className="space-y-6 lg:col-span-2">
              <AskPanel token={token} className="glass holographic" />
              <Card className="glass holographic">
                <CardContent className="p-5">
                  <AttendanceList attendance={attendance} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-xs text-electric-blue opacity-70"
        >
          Tip: For best results, keep the mic close to the teacher and use a quiet room.
        </motion.div>
      </div>
    </div>
  );
}

