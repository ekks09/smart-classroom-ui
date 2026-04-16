'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAudioStream } from '@/hooks/useAudioStream';
import { AudioVisualizer } from '@/components/scholar/AudioVisualizer';
import { TerminalText } from '@/components/scholar/TerminalText';
import { Header } from '@/components/layout/Header';
import { FloatingIcons } from '@/components/scholar/FloatingIcons';
import { ScanlineOverlay } from '@/components/scholar/ScanlineOverlay';

export default function LivePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { isRecording, transcript, startRecording, stopRecording } = useAudioStream(useAuth().token);
  const [fullTranscript, setFullTranscript] = useState('');

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-black relative">
      <ScanlineOverlay />
      <FloatingIcons />

      <Header />

      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-cyber-cyan mb-8">Sensor Array</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Audio Visualizer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="holographic">
                <CardContent className="p-8 text-center">
                  <CardTitle className="text-xl text-cyber-cyan mb-6">
                    Voice Recognition
                  </CardTitle>

                  <AudioVisualizer isActive={isRecording} />

                  <div className="mt-6">
                    <Button
                      variant={isRecording ? "neonPurple" : "neon"}
                      size="lg"
                      onClick={isRecording ? stopRecording : startRecording}
                      className="w-full"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-5 h-5 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-cyber-blue mt-4">
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
              <Card className="holographic">
                <CardContent className="p-8">
                  <CardTitle className="text-xl text-cyber-cyan mb-6">
                    Live Transcript
                  </CardTitle>

                  <div className="bg-cyber-black border border-cyber-cyan/20 rounded p-4 h-64 overflow-y-auto font-mono text-green-400">
                    {fullTranscript ? (
                      <TerminalText text={fullTranscript} speed={10} />
                    ) : (
                      <p className="text-cyber-blue opacity-50">
                        Waiting for audio input...
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between text-sm text-cyber-blue">
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