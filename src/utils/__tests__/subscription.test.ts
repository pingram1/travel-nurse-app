import { isProUser, SUBSCRIPTION_PLANS } from '../subscription';
import type { User } from '@/types';

const user = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'jane@hospital.org',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'nurse',
  credentialsVerified: true,
  permissions: ['vault:read', 'vault:write'],
  ...overrides,
});

describe('subscription', () => {
  it('lists the CEO pricing tiers', () => {
    expect(SUBSCRIPTION_PLANS.map((p) => p.priceCents)).toEqual([1299, 7899, 15699]);
  });

  it('treats an active plan as Pro', () => {
    expect(isProUser(user({ subscriptionStatus: 'active', subscriptionPlanId: 'monthly' }))).toBe(
      true,
    );
    expect(isProUser(user({ subscriptionStatus: 'none' }))).toBe(false);
    expect(isProUser(null)).toBe(false);
  });
});
