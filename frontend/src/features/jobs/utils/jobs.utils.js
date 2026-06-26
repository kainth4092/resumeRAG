export const getLogoColor = (name) => {
  if (!name) return "#7C3AED";
  const colors = [
    "#635BFF",
    "#5E6AD2",
    "#000000",
    "#d97706",
    "#F24E1E",
    "#10b981",
    "#3b82f6",
    "#ec4899",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
