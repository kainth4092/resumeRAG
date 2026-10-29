export const asText = (value) => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return asText(
      value.sample_answer ??
        value.content ??
        value.text ??
        value.answer ??
        value.value ??
        "",
    );
  }
  return String(value);
};

export const estimateMinutes = (value, fallback = 3) => {
  if (!value || typeof value !== "object") return fallback;
  const duration = value.duration;
  if (typeof duration === "number") return duration;
  if (typeof duration !== "string") return fallback;
  const numbers = duration.match(/\d+/g);
  if (!numbers || numbers.length === 0) return fallback;
  const parsed = Number(numbers[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
};
