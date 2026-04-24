'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

type SemesterPlan = any;

export default function SemesterPlannerPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user, token } = useAuth();
  const [subject, setSubject] = useState('');
  const [weeks, setWeeks] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState<SemesterPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAccess = useMemo(
    () => user?.role === 'teacher' || user?.role === 'admin',
    [user?.role]
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  const onGenerate = async () => {
    if (!subject.trim()) return;
    setSubmitting(true);
    setError(null);
    setPlan(null);
    try {
      const res = await api.generateSemester(subject.trim(), weeks, token);
      setPlan(res?.semester_plan ?? res);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate semester plan');
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
              <Calendar className="h-5 w-5" />
              Auto Semester Planner
            </CardTitle>
            <p className="text-sm text-electric-blue">
              Teacher-only. Calls backend `POST /generate-semester`.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {!canAccess ? (
              <div className="text-warning-purple">
                You don&apos;t have access to this page.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject (e.g. Calculus)"
                    className="bg-transparent border-neon-cyan/50 text-neon-cyan md:col-span-2"
                    disabled={submitting}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={52}
                    value={weeks}
                    onChange={(e) => setWeeks(Number(e.target.value))}
                    className="bg-transparent border-neon-cyan/50 text-neon-cyan"
                    disabled={submitting}
                  />
                </div>

                <Button onClick={onGenerate} disabled={submitting || !subject.trim()}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  {submitting ? 'Generating…' : 'Generate Plan'}
                </Button>

                {error && <div className="text-sm text-warning-purple">{error}</div>}

                {plan && (
                  <div className="space-y-3">
                    {Array.isArray(plan) ? (
                      plan.map((item, index) => (
                        <details
                          key={index}
                          className="rounded-lg border border-neon-cyan/20 bg-transparent p-4"
                          open={index < 2}
                        >
                          <summary className="cursor-pointer text-neon-cyan font-semibold">
                            {item?.week ? `Week ${item.week}` : `Week ${index + 1}`}
                            {item?.topic ? ` — ${item.topic}` : ''}
                          </summary>
                          <pre className="mt-3 whitespace-pre-wrap text-sm text-electric-blue">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        </details>
                      ))
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm text-electric-blue">
                        {JSON.stringify(plan, null, 2)}
                      </pre>
                    )}
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

