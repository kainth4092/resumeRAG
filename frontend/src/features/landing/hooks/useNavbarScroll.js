import { useState, useEffect } from "react";

export default function useNavbarScroll() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      const scrollTop =
        target === document
          ? window.scrollY || document.documentElement.scrollTop
          : target.scrollTop || 0;
      setNavScrolled(scrollTop > 20);
    };
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, []);

  return navScrolled;
}
