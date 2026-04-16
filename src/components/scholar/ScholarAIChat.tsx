'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, BookOpen, GraduationCap } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types';
import { FloatingIcons } from './FloatingIcons';
import { NeonCard } from './NeonCard';
import { TerminalText } from './TerminalText';

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
    <div className="relative min-h-screen bg-cyber-black scanlines">
      <FloatingIcons />

      {/* Spline Background */}
      <div className="absolute inset-0 z-0">
        <Spline scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" />
      </div>

      {/* Main Chat Interface */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyber-cyan/20">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-cyber-cyan glow" />
            <h1 className="text-2xl font-bold text-cyber-cyan">Scholar's AI</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
              <span className="text-sm text-cyber-cyan">System Online</span>
            </div>
          </div>
        </div>

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
                <NeonCard className={`max-w-[70%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                  <CardContent className="p-4">
                    {message.role === 'assistant' ? (
                      <TerminalText text={message.content} />
                    ) : (
                      <p className="text-cyber-cyan">{message.content}</p>
                    )}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-cyber-blue font-semibold">Sources:</p>
                        {message.citations.map((citation) => (
                          <Badge key={citation.id} variant="dataChip" className="mr-2 mb-2">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {citation.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </NeonCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <NeonCard className="max-w-[70%]">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-cyber-cyan animate-pulse" />
                    <span className="text-cyber-cyan">Processing neural pathways...</span>
                  </div>
                </CardContent>
              </NeonCard>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-cyber-cyan/20">
          <div className="flex space-x-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Query the Neural Net..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              variant="neon"
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};