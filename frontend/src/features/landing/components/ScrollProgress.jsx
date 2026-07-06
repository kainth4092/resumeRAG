import React, { useState, useEffect } from "react";

function ScrollProgress() {
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const scrolled = (window.scrollY / totalScroll) * 100;
        setScrollWidth(scrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
      <div
        className="h-full bg-indigo-600 transition-all duration-100"
        style={{ width: `${scrollWidth}%` }}
      />
    </div>
  );
}

export default React.memo(ScrollProgress);
