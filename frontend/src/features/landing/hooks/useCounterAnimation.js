import { useState, useEffect, useRef } from "react";

export default function useCounterAnimation(to, duration = 2000) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  const elRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !ref.current) {
          ref.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            setVal(Math.round(p ** 0.5 * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    if (elRef.current) observer.observe(elRef.current);
    return () => observer.disconnect();
  }, [to, duration]);

  return { val, elRef };
}
