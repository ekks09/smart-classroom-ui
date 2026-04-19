'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain } from 'lucide-react';
// import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types';
import { FloatingIcons } from './FloatingIcons';
import { FloatingOrbs } from './FloatingOrbs';
import { TerminalText } from './TerminalText';

// const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });

interface ScholarAIChatProps {
  selectedLectureId?: string;
}

export const ScholarAIChat: React.FC<ScholarAIChatProps> = ({ selectedLectureId }) => {
  const { token } = useAuth();
  const { messages, loading, sendMessage } = useChat(token);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, selectedLectureId);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative min-h-screen bg-void-black scanlines">
      <FloatingIcons />

      {/* Spline Brain in top-right - Temporarily disabled for build */}
      {/* <div className="absolute top-6 right-6 w-64 h-64 z-20">
        <Spline scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" />
      </div> */}

      {/* Floating Orbs FAB */}
      <FloatingOrbs />

      {/* Main Chat Interface */}
      <div className="relative z-10 flex flex-col h-screen pt-20">
        {/* Messages */}
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
                  <div className="max-w-[70%] glass rounded-lg border border-neon-cyan p-4">
                    <p className="text-neon-cyan">{message.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[70%] bg-transparent border-l-4 border-neon-cyan p-4 rounded-r-lg">
                    <TerminalText text={message.content} />
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-electric-blue font-semibold">Sources:</p>
                        {message.sources.map((source, index) => (
                          <Badge key={index} className="mr-2 mb-2 bg-electric-blue/20 text-electric-blue border-electric-blue">
                            {source.lecture_title} • chunk {source.chunk_idx}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="max-w-[70%] bg-transparent border-l-4 border-neon-cyan p-4 rounded-r-lg">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-neon-cyan animate-pulse" />
                  <span className="text-neon-cyan">Processing neural pathways...</span>
                </div>
                {/* Scanning laser line */}
                <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scan"></div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar - Terminal Style */}
        <div className="p-6 border-t border-neon-cyan/20 bg-void-black/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 bg-void-black border border-neon-cyan/50 rounded-lg p-3">
            <span className="text-neon-cyan">$</span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Query the Neural Net..."
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
      </div>
    </div>
  );
};