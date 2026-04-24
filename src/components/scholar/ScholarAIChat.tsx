'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Database, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spotlight } from '@/components/ui/spotlight';
import { SplineScene } from '@/components/ui/splite';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { TerminalText } from './TerminalText';

interface ScholarAIChatProps {
  selectedLectureId?: string;
}

export const ScholarAIChat: React.FC<ScholarAIChatProps> = ({ selectedLectureId }) => {
  const { token } = useAuth();
  const { messages, loading, sendMessage } = useChat(token);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'rag' | 'general'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, selectedLectureId, mode);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 pt-24">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="glass holographic lg:col-span-3">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-neon-cyan">ScholarAI</CardTitle>
              <div className="flex items-center gap-2">
                {selectedLectureId ? (
                  <Badge className="bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30">
                    Lecture selected
                  </Badge>
                ) : (
                  <Badge className="bg-warning-purple/15 text-warning-purple border-warning-purple/30">
                    No lecture
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode((m) => (m === 'rag' ? 'general' : 'rag'))}
                  className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Database className="mr-2 h-4 w-4" />
                  RAG: {mode === 'rag' ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
            {mode === 'rag' && !selectedLectureId && (
              <div className="text-xs text-electric-blue">
                Tip: select a lecture from the drawer for better grounded answers.
              </div>
            )}
          </CardHeader>

          <CardContent className="flex h-[calc(100vh-12rem)] flex-col p-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'user' ? (
                      <div className="max-w-[80%] glass rounded-lg border border-neon-cyan p-4">
                        <p className="text-neon-cyan">{message.content}</p>
                      </div>
                    ) : (
                      <div className="max-w-[80%] bg-transparent border-l-4 border-neon-cyan p-4 rounded-r-lg">
                        <TerminalText text={message.content} />
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-electric-blue font-semibold">Sources:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source, index) => (
                                <Badge
                                  key={index}
                                  className="bg-electric-blue/20 text-electric-blue border-electric-blue"
                                >
                                  {source.lecture_title} • chunk {source.chunk_idx}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="max-w-[80%] bg-transparent border-l-4 border-neon-cyan p-4 rounded-r-lg">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-neon-cyan animate-pulse" />
                      <span className="text-neon-cyan">Processing neural pathways...</span>
                    </div>
                    <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scan"></div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-neon-cyan/20 bg-void-black/50 backdrop-blur-sm p-4">
              <div className="flex items-center space-x-3 bg-void-black border border-neon-cyan/50 rounded-lg p-3">
                <span className="text-neon-cyan">$</span>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent border-none text-neon-cyan placeholder-neon-cyan/50 focus:ring-0"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-neon-cyan hover:bg-neon-cyan/80 text-void-black rounded-full p-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/[0.96] relative overflow-hidden lg:col-span-2">
          <Spotlight className="-top-40 left-0 md:left-10 md:-top-20" fill="white" />
          <CardContent className="p-0 h-[calc(100vh-12rem)]">
            <div className="relative h-full">
              <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/10 via-black/0 to-black/50" />
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

