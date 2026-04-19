'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ScholarAIChat } from '@/components/scholar/ScholarAIChat';
import { ContextDrawer } from '@/components/layout/ContextDrawer';
import { FloatingOrbs } from '@/components/scholar/FloatingOrbs';

export default function ChatPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState<string>();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      <ContextDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        onSelectLecture={setSelectedLectureId}
        selectedLectureId={selectedLectureId}
      />

      <ScholarAIChat selectedLectureId={selectedLectureId} />

      <FloatingOrbs />
    </div>
  );
}