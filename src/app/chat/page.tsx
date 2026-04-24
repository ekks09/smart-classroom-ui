'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ScholarAIChat } from '@/components/scholar/ScholarAIChat';
import { ContextDrawer } from '@/components/layout/ContextDrawer';
import { FloatingOrbs } from '@/components/scholar/FloatingOrbs';
import { Header } from '@/components/layout/Header';

export default function ChatPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState<string | undefined>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Get lecture ID from URL params
    const lectureId = searchParams.get('lecture');
    if (lectureId) {
      setSelectedLectureId(lectureId);
    }
  }, [isAuthenticated, router, searchParams]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-void-black">
      <Header />
      <ContextDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        onSelectLecture={(id) => {
          setSelectedLectureId(id);
          // Update URL without triggering navigation
          const url = new URL(window.location.href);
          url.searchParams.set('lecture', id);
          window.history.replaceState({}, '', url.toString());
        }}
        selectedLectureId={selectedLectureId}
      />

      <ScholarAIChat selectedLectureId={selectedLectureId} />

      <FloatingOrbs />
    </div>
  );
}