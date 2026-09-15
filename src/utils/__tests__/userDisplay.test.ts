import { greetingFirstName, namesFromEmail, userInitials } from '../userDisplay';
import type { User } from '@/types';

const user = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'jane.doe@hospital.org',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'nurse',
  credentialsVerified: true,
  permissions: ['vault:read', 'vault:write'],
  ...overrides,
});

describe('userDisplay', () => {
  it('returns the first name for greetings', () => {
    expect(greetingFirstName(user())).toBe('Jane');
    expect(greetingFirstName(null)).toBeNull();
    expect(greetingFirstName(user({ firstName: '  ' }))).toBeNull();
  });

  it('builds initials from first and last name', () => {
    expect(userInitials(user())).toBe('JD');
    expect(userInitials(null)).toBe('TN');
  });

  it('parses names from an email local-part', () => {
    expect(namesFromEmail('jane.doe@hospital.org')).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(namesFromEmail('maya@hospital.org')).toEqual({
      firstName: 'Maya',
      lastName: '',
    });
  });
});
