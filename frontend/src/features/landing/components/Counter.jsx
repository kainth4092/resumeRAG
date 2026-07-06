import React from "react";
import useCounterAnimation from "../hooks/useCounterAnimation";

function Counter({ to, suffix = "", duration = 2000 }) {
  const { val, elRef } = useCounterAnimation(to, duration);

  return (
    <span ref={elRef}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export default React.memo(Counter);
