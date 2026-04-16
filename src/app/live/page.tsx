'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAudioStream } from '@/hooks/useAudioStream';
import { AudioVisualizer } from '@/components/scholar/AudioVisualizer';
import { TerminalText } from '@/components/scholar/TerminalText';
import { FloatingIcons } from '@/components/scholar/FloatingIcons';

export default function LivePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { isRecording, transcript, startRecording, stopRecording, isConnected, liveSession } = useAudioStream(useAuth().token);
  const [fullTranscript, setFullTranscript] = useState('');
  const [sessionTitle, setSessionTitle] = useState('Live Lecture');
  const [course, setCourse] = useState('General');

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  React.useEffect(() => {
    if (transcript) {
      setFullTranscript(prev => prev + ' ' + transcript);
    }
  }, [transcript]);

  const handleStartRecording = async () => {
    try {
      await startRecording(sessionTitle, course);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const canStream = user?.role === 'teacher' || user?.role === 'admin';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-void-black relative scanlines">
      <FloatingIcons />

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neon-cyan/20">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-neon-cyan">Sensor Array</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
            <span className="text-sm text-neon-cyan">Active</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Audio Visualizer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass holographic">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl text-neon-cyan mb-6">
                    Voice Recognition
                  </h3>

                  <AudioVisualizer isActive={isRecording} />

                  <div className="mt-6 space-y-4">
                    {!canStream && (
                      <p className="text-warning-purple text-sm">Teacher access required for streaming</p>
                    )}

                    {canStream && (
                      <>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Session title"
                            value={sessionTitle}
                            onChange={(e) => setSessionTitle(e.target.value)}
                            className="w-full bg-transparent border border-neon-cyan/50 rounded px-3 py-2 text-neon-cyan placeholder-neon-cyan/50"
                          />
                          <input
                            type="text"
                            placeholder="Course"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="w-full bg-transparent border border-neon-cyan/50 rounded px-3 py-2 text-neon-cyan placeholder-neon-cyan/50"
                          />
                        </div>

                        <Button
                          className={`w-full ${isRecording ? 'bg-warning-purple hover:bg-warning-purple/80' : 'bg-neon-cyan hover:bg-neon-cyan/80'} text-void-black`}
                          size="lg"
                          onClick={isRecording ? stopRecording : handleStartRecording}
                          disabled={!isConnected}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="w-5 h-5 mr-2" />
                              Stop Streaming
                            </>
                          ) : (
                            <>
                              <Mic className="w-5 h-5 mr-2" />
                              Start Live Stream
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    <div className="flex items-center justify-center space-x-2 mt-4">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-cyan' : 'bg-warning-purple'}`}></div>
                      <span className="text-sm text-neon-cyan">{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>

                  <p className="text-sm text-electric-blue mt-4">
                    Status: {isRecording ? 'Active' : 'Standby'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Transcript */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass holographic">
                <CardContent className="p-8">
                  <h3 className="text-xl text-neon-cyan mb-6">
                    Live Transcript
                  </h3>

                  <div className="bg-void-black border border-neon-cyan/20 rounded p-4 h-64 overflow-y-auto font-mono text-green-400">
                    {fullTranscript ? (
                      <TerminalText text={fullTranscript} speed={10} />
                    ) : (
                      <p className="text-electric-blue opacity-50">
                        Waiting for audio input...
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between text-sm text-electric-blue">
                    <span>Confidence: 98%</span>
                    <span>Latency: 120ms</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}