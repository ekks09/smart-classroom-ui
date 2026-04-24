'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { TranscriptEntry } from '@/hooks/useAudioStream';

type TranscriptFeedProps = {
  transcripts: TranscriptEntry[];
  className?: string;
};

export function TranscriptFeed({ transcripts, className }: TranscriptFeedProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts.length]);

  return (
    <div className={cn('space-y-3 overflow-y-auto', className)}>
      {transcripts.length === 0 ? (
        <div className="text-sm text-electric-blue opacity-70">
          Waiting for transcript…
        </div>
      ) : (
        transcripts.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-neon-cyan/20 bg-black/20 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-neon-cyan">
                {item.speaker ? item.speaker : 'Speaker'}
              </div>
              {item.ts && (
                <div className="text-[10px] text-electric-blue opacity-70">
                  {typeof item.ts === 'number'
                    ? new Date(item.ts).toLocaleTimeString()
                    : new Date(item.ts).toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-electric-blue">
              {item.transcript}
            </div>
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}

