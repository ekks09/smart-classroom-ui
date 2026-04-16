import { useState, useCallback } from 'react';
import { ChatMessage, AskRequest } from '@/types';
import { api } from '@/lib/api';

export const useChat = (token: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, lectureId?: string, mode: 'rag' | 'general' = 'general') => {
    if (!token) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const request: AskRequest = {
        question: content,
        lecture_id: lectureId,
        mode,
      };

      const response = await api.askQuestion(token, request);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        role: 'assistant',
        citations: response.citations,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    clearMessages,
  };
};