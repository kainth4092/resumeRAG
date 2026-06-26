import { useEffect, useRef, useState } from "react";

export default function Counter({ to, suffix = "" }) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const dur = 1200;
        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(eased * to));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [to]);
    return <span>{val}{suffix}</span>;
}