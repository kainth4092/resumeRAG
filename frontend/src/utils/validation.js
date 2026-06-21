export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

export const isValidLinkedIn = (url) =>
  !url || /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(url);

export const isValidGithub = (url) =>
  !url || /^https?:\/\/(www\.)?github\.com\/.+/.test(url);

export const isValidPortfolio = (url) => !url || /^https?:\/\/.+/.test(url);
