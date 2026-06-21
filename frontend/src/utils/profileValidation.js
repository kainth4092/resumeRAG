import {
  isValidEmail,
  isValidPhone,
  isValidGithub,
  isValidLinkedIn,
  isValidPortfolio,
} from "./validation";

export function validateProfile(profile) {
  const errors = {};

  if (!profile.full_name?.trim()) errors.full_name = "Full Name is required.";
  else if (profile.full_name.trim().length < 2)
    errors.full_name = "Minimum 2 characters.";

  if (!profile.email?.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(profile.email)) errors.email = "Invalid email.";

  if (!profile.phone?.trim()) errors.phone = "Phone is required.";
  else if (!isValidPhone(profile.phone)) errors.phone = "Invalid phone number.";

  if (profile.linkedin && !isValidLinkedIn(profile.linkedin))
    errors.linkedin = "Invalid LinkedIn URL.";

  if (profile.github && !isValidGithub(profile.github))
    errors.github = "Invalid Github URL.";

  if (profile.portfolio && !isValidPortfolio(profile.portfolio))
    errors.portfolio = "Invalid Portfolio URL.";

  if (!profile.headline?.trim()) errors.headline = "Headline is required.";

  if (!profile.summary?.trim()) errors.summary = "Summary is required.";

  return errors;
}
