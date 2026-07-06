export const easeOutQuad = (t) => t * (2 - t);

export const getFadeInDelayStyle = (delayMs) => {
  return {
    animationDelay: `${delayMs}ms`,
    animationFillMode: "both",
  };
};
