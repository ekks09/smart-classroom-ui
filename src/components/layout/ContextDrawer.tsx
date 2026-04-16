'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Lecture } from '@/types';

interface ContextDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectLecture: (lectureId: string) => void;
  selectedLectureId?: string;
}

export const ContextDrawer: React.FC<ContextDrawerProps> = ({
  isOpen,
  onToggle,
  onSelectLecture,
  selectedLectureId,
}) => {
  const { token } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && isOpen) {
      fetchLectures();
    }
  }, [token, isOpen]);

  const fetchLectures = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getLectures(token);
      setLectures(data);
    } catch (error) {
      console.error('Failed to fetch lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed left-0 top-0 h-full w-80 bg-cyber-black/90 backdrop-blur-md border-r border-cyber-cyan/20 z-40"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-cyber-cyan">Knowledge Base</h2>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            {loading ? (
              <div className="text-center text-cyber-cyan">Loading lectures...</div>
            ) : (
              <div className="space-y-3">
                {lectures.map((lecture) => (
                  <Card
                    key={lecture.id}
                    className={`cursor-pointer transition-all ${
                      selectedLectureId === lecture.id
                        ? 'border-cyber-cyan bg-cyber-cyan/10'
                        : 'border-cyber-cyan/20 hover:border-cyber-cyan/50'
                    }`}
                    onClick={() => onSelectLecture(lecture.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <BookOpen className="w-5 h-5 text-cyber-cyan mt-1 flex-shrink-0" />
                        <div>
                          <CardTitle className="text-sm text-cyber-cyan mb-1">
                            {lecture.title}
                          </CardTitle>
                          <p className="text-xs text-cyber-blue">
                            {new Date(lecture.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {!isOpen && (
        <Button
          variant="neon"
          size="icon"
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50"
          onClick={onToggle}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </AnimatePresence>
  );
};