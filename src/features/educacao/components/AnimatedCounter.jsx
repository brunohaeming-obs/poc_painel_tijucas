import { useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AnimatedCounter({
  value,
  duration = 1100,
  formatter = (nextValue) => String(nextValue),
  isActive = true,
  animateKey = "",
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousTargetRef = useRef(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!Number.isFinite(value)) {
      setDisplayValue(value);
      return undefined;
    }

    if (!isActive || prefersReducedMotion()) {
      setDisplayValue(value);
      previousTargetRef.current = value;
      return undefined;
    }

    const startValue = hasAnimatedRef.current ? previousTargetRef.current : 0;
    const delta = value - startValue;
    const startedAt = performance.now();
    let frameId = 0;

    function tick(now) {
      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const nextValue = startValue + delta * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        previousTargetRef.current = value;
        hasAnimatedRef.current = true;
      }
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [animateKey, duration, isActive, value]);

  return formatter(displayValue);
}
