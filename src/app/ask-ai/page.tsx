'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

type QAItem = {
  id: string;
  question: string;
  answer: string;
};

export default function AskAIPage() {
  const router = useRouter();
  const { isAuthenticated, loading, token } = useAuth();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<QAItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  const onAsk = async () => {
    if (!question.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.ask(question.trim(), token);
      const answer =
        typeof res?.answer === 'string' ? res.answer : JSON.stringify(res?.answer ?? res);

      const item: QAItem = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        question: question.trim(),
        answer,
      };
      setHistory((prev) => [item, ...prev].slice(0, 20));
      setQuestion('');
    } catch (err: any) {
      setError(err?.message || 'Failed to ask AI');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-void-black relative scanlines">
      <Header />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10 pt-24">
        <Card className="glass holographic">
          <CardHeader className="space-y-2">
            <CardTitle className="text-neon-cyan flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Ask AI (RAG)
            </CardTitle>
            <p className="text-sm text-electric-blue">
              Sends your question to the backend `POST /ask`.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What is gradient descent?"
                className="bg-transparent border-neon-cyan/50 text-neon-cyan"
                disabled={submitting}
              />
              <Button onClick={onAsk} disabled={submitting || !question.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Ask
              </Button>
            </div>

            {error && <div className="text-sm text-warning-purple">{error}</div>}

            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-sm text-electric-blue opacity-70">
                  No questions yet.
                </div>
              ) : (
                history.map((item) => (
                  <Card key={item.id} className="bg-transparent border border-neon-cyan/20">
                    <CardContent className="p-4 space-y-2">
                      <div className="text-neon-cyan font-semibold">Q: {item.question}</div>
                      <div className="text-electric-blue whitespace-pre-wrap">A: {item.answer}</div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

