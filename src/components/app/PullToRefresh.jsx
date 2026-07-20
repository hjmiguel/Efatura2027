import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullRef = useRef(0);
  const pulling = useRef(false);

  const onTouchStart = useCallback((e) => {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const onTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      const newPull = Math.min(delta * 0.5, THRESHOLD * 1.5);
      pullRef.current = newPull;
      setPull(newPull);
    }
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullRef.current >= THRESHOLD) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        await onRefresh();
      } catch (err) {
        console.error('PullToRefresh error:', err);
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
    pullRef.current = 0;
  }, [onRefresh, refreshing]);

  const progress = Math.min(pull / THRESHOLD, 1);

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <motion.div
        animate={{ y: pull }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="relative"
      >
        {(pull > 0 || refreshing) && (
          <div
            className="absolute bottom-full left-0 right-0 flex items-end justify-center pb-2"
            style={{ height: Math.max(pull, 30) }}
          >
            {refreshing ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <motion.div animate={{ rotate: progress * 180 }} style={{ opacity: progress }}>
                <ArrowDown className="w-5 h-5 text-primary" />
              </motion.div>
            )}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}