import React from 'react';
import { useScrollProgress } from '@/hooks/useAnimations';

export default function ScrollProgressBar() {
  const progress = useScrollProgress();
  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%` }}
    />
  );
}