'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DataChipProps {
  title: string;
  content: string;
  page?: number;
}

export const DataChip: React.FC<DataChipProps> = ({ title, content, page }) => {
  return (
    <Badge variant="dataChip" className="inline-block mr-2 mb-2">
      <div className="flex flex-col items-start">
        <span className="font-semibold">{title}</span>
        {page && <span className="text-xs opacity-75">Page {page}</span>}
        <span className="text-xs mt-1 opacity-90">{content.slice(0, 50)}...</span>
      </div>
    </Badge>
  );
};