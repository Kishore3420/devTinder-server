import { User } from '../types/user';
export const sanitizeUserData = (data: User): Partial<User> => {
  const sanitized: User = { ...data };

  if (sanitized.firstName) {
    sanitized.firstName = sanitized.firstName.trim();
  }
  if (sanitized.lastName) {
    sanitized.lastName = sanitized.lastName.trim();
  }
  if (sanitized.emailId) {
    sanitized.emailId = sanitized.emailId.toLowerCase().trim();
  }
  if (sanitized.photoUrl) {
    sanitized.photoUrl = sanitized.photoUrl.trim();
  }
  if (sanitized.about) {
    sanitized.about = sanitized.about.trim();
  }
  if (sanitized.skills && Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills.map((skill: string) => skill.trim());
  }

  return sanitized;
};
