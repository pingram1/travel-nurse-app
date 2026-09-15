import type { User } from '@/types';

function titleCaseToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/** Display name for greetings — null when the session has no first name. */
export function greetingFirstName(user: User | null): string | null {
  const name = user?.firstName?.trim();
  return name ? name : null;
}

export function userInitials(user: User | null): string {
  const first = user?.firstName?.trim().charAt(0) ?? '';
  const last = user?.lastName?.trim().charAt(0) ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || 'TN';
}

/** Mock-auth helper: `jane.doe@hospital.org` → Jane / Doe. */
export function namesFromEmail(email: string): { firstName: string; lastName: string } {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._+-]+/).filter((part) => /[a-z]/i.test(part));
  return {
    firstName: parts[0] ? titleCaseToken(parts[0]) : '',
    lastName: parts[1] ? titleCaseToken(parts.slice(1).join(' ')) : '',
  };
}
