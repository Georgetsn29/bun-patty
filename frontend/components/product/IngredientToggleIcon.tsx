'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';

interface IngredientToggleIconProps {
  isIncluded: boolean;
  isRequired?: boolean;
  className?: string;
}

/**
 * Reusable animated toggle icon that smoothly morphs between
 * a pastel green checkmark (#A8E6C1) and a pastel red X (#F4A9A8)
 * using exactly two SVG lines and Framer Motion.
 */
export const IngredientToggleIcon: React.FC<IngredientToggleIconProps> = ({
  isIncluded,
  isRequired = false,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const controls = useAnimationControls();
  const isFirstMount = useRef(true);
  const prevIncluded = useRef(isIncluded);

  // Selected, check, pastel green #A8E6C1
  // Required: slightly muted check
  // Removed, X, pastel red #F4A9A8
  const checkColor = isRequired ? 'rgba(168, 230, 193, 0.55)' : '#A8E6C1';
  const strokeColor = isIncluded ? checkColor : '#F4A9A8';

  // Selected (check):
  // Short stick: x1=5, y1=12.5, x2=10, y2=17.5
  // Long stick: x1=10, y1=17.5, x2=19, y2=7
  // Removed (X):
  // Short stick: x1=6, y1=6, x2=18, y2=18
  // Long stick: x1=6, y1=18, x2=18, y2=6
  const line1 = isIncluded
    ? { x1: 5, y1: 12.5, x2: 10, y2: 17.5 }
    : { x1: 6, y1: 6, x2: 18, y2: 18 };

  const line2 = isIncluded
    ? { x1: 10, y1: 17.5, x2: 19, y2: 7 }
    : { x1: 6, y1: 18, x2: 18, y2: 6 };

  // Trigger scale dip (1 -> 0.9 -> 1) on click when state changes after initial mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (prevIncluded.current !== isIncluded && !isRequired && !shouldReduceMotion) {
      prevIncluded.current = isIncluded;
      controls.start({
        scale: [1, 0.9, 1],
        transition: { duration: 0.3, ease: 'easeInOut' },
      });
    } else {
      prevIncluded.current = isIncluded;
    }
  }, [isIncluded, isRequired, shouldReduceMotion, controls]);

  const lineTransition =
    shouldReduceMotion || isRequired
      ? { duration: 0 }
      : { duration: 0.3, ease: 'easeInOut' as const };

  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={28}
      height={28}
      fill="none"
      initial={false}
      animate={controls}
      whileTap={!isRequired && !shouldReduceMotion ? { scale: 0.9 } : undefined}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <motion.line
        x1={line1.x1}
        y1={line1.y1}
        x2={line1.x2}
        y2={line1.y2}
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinecap="round"
        initial={false}
        animate={{
          x1: line1.x1,
          y1: line1.y1,
          x2: line1.x2,
          y2: line1.y2,
          stroke: strokeColor,
        }}
        transition={lineTransition}
      />
      <motion.line
        x1={line2.x1}
        y1={line2.y1}
        x2={line2.x2}
        y2={line2.y2}
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinecap="round"
        initial={false}
        animate={{
          x1: line2.x1,
          y1: line2.y1,
          x2: line2.x2,
          y2: line2.y2,
          stroke: strokeColor,
        }}
        transition={lineTransition}
      />
    </motion.svg>
  );
};
