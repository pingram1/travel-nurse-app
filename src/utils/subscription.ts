import type { SubscriptionPlanId, User } from '@/types';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  label: string;
  cadence: string;
  priceCents: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'monthly', label: 'Monthly', cadence: 'per month', priceCents: 1299 },
  { id: 'semiannual', label: 'Semi-annually', cadence: 'every 6 months', priceCents: 7899 },
  { id: 'annual', label: 'Annually', cadence: 'per year', priceCents: 15699 },
];

export function isProUser(user: User | null | undefined): boolean {
  return Boolean(user?.subscriptionStatus === 'active' && user.subscriptionPlanId);
}

export function planById(id: SubscriptionPlanId): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
}
