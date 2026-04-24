'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type AttendanceListProps = {
  attendance: string[];
  className?: string;
};

export function AttendanceList({ attendance, className }: AttendanceListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="text-neon-cyan font-semibold">Live Attendance</div>
        <div className="text-electric-blue text-sm">
          {attendance.length} present
        </div>
      </div>

      {attendance.length === 0 ? (
        <div className="text-sm text-electric-blue opacity-70">
          No students joined yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {attendance.map((studentId) => (
            <div
              key={studentId}
              className="rounded-lg border border-neon-cyan/20 bg-black/20 px-3 py-2 text-sm text-electric-blue"
            >
              {studentId}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

