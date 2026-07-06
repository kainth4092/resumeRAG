import { useState, useEffect } from "react";

export default function useNavbarScroll() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      setNavScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return navScrolled;
}
