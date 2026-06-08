import { useEffect, useMemo, useState } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TypewriterText({
  text,
  isActive = true,
  restartKey = "",
  intervalMs = 60,
  className = "",
}) {
  const words = useMemo(() => text.split(" ").filter(Boolean), [text]);
  const [visibleCount, setVisibleCount] = useState(words.length);

  useEffect(() => {
    if (!isActive || prefersReducedMotion()) {
      setVisibleCount(words.length);
      return undefined;
    }

    setVisibleCount(0);
    let currentIndex = 0;
    const timer = window.setInterval(() => {
      currentIndex += 1;
      setVisibleCount(Math.min(currentIndex, words.length));

      if (currentIndex >= words.length) {
        window.clearInterval(timer);
      }
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, isActive, restartKey, words.length]);

  const visibleText = words.slice(0, visibleCount).join(" ");

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{visibleText}</span>
    </span>
  );
}
