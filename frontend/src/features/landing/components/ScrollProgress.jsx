import React, { useState, useEffect } from "react";

function ScrollProgress() {
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target;
      let scrollTop, scrollHeight, clientHeight;

      if (target === document) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else {
        scrollTop = target.scrollTop || 0;
        scrollHeight = target.scrollHeight;
        clientHeight = target.clientHeight;
      }

      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll > 0) {
        const scrolled = (scrollTop / totalScroll) * 100;
        setScrollWidth(scrolled);
      } else {
        setScrollWidth(0);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-100 pointer-events-none">
      <div
        className="h-full bg-indigo-600 transition-all duration-100"
        style={{ width: `${scrollWidth}%` }}
      />
    </div>
  );
}

export default React.memo(ScrollProgress);
