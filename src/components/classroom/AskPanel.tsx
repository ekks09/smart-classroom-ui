'use client';

import React, { useState } from 'react';
import { Brain, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

type AskPanelProps = {
  token?: string | null;
  className?: string;
};

export function AskPanel({ token, className }: AskPanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await api.ask(question.trim(), token);
      const text = typeof res?.answer === 'string' ? res.answer : JSON.stringify(res?.answer ?? res);
      setAnswer(text);
      setQuestion('');
    } catch (err: any) {
      setError(err?.message || 'Failed to ask AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-neon-cyan flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Ask During Lecture
        </CardTitle>
        <div className="text-xs text-electric-blue">
          Uses backend `POST /ask`.
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question…"
            className="bg-transparent border-neon-cyan/50 text-neon-cyan"
            disabled={loading}
          />
          <Button onClick={onAsk} disabled={loading || !question.trim()}>
            <Send className="mr-2 h-4 w-4" />
            Ask
          </Button>
        </div>

        {error && <div className="text-sm text-warning-purple">{error}</div>}

        {loading && <div className="text-sm text-electric-blue">Thinking…</div>}

        {answer && (
          <div className="rounded-lg border border-neon-cyan/20 bg-black/20 p-3 text-sm text-electric-blue whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

