'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizeHandleProps {
  side: 'left' | 'right';
  onResize: (delta: number) => void;
}

export function ResizeHandle({ side, onResize }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    lastX.current = e.clientX;
    setIsDragging(true);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    lastX.current = touch.clientX;
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - lastX.current;
      lastX.current = e.clientX;
      onResize(side === 'right' ? -delta : delta);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const delta = touch.clientX - lastX.current;
      lastX.current = touch.clientX;
      onResize(side === 'right' ? -delta : delta);
    };

    const onEnd = () => setIsDragging(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, onResize, side]);

  return (
    <div
      className={`w-1 cursor-col-resize hover:bg-blue-400 transition-colors flex-shrink-0
        ${isDragging ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-300 dark:hover:bg-blue-600'}`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    />
  );
}
