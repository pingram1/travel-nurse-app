import { BOOKING_HREF, getNextStep, getStepRoute, resolveWorkflowSteps } from '../booking';

describe('booking utils', () => {
  it('prioritizes housing when housing-first is enabled', () => {
    expect(resolveWorkflowSteps(true)[0]).toBe('housing');
    expect(resolveWorkflowSteps(false)[0]).toBe('flights');
  });

  it('keeps flights optional in the hub workflow (no mandatory seats step)', () => {
    const steps = resolveWorkflowSteps(true);
    expect(steps).toContain('flights');
    expect(steps).toContain('dining');
    expect(steps).toContain('ground');
    expect(steps).not.toContain('seats');
    expect(steps[steps.length - 1]).toBe('review');
  });

  it('returns the next workflow step', () => {
    const steps = resolveWorkflowSteps(true);
    expect(getNextStep(steps, 'housing')).toBe('flights');
    expect(getNextStep(steps, 'flights')).toBe('dining');
    expect(getNextStep(steps, 'dining')).toBe('ground');
  });

  it('uses absolute Expo Router hrefs (avoids Unmatched Route /--/)', () => {
    expect(getStepRoute('dining')).toBe(BOOKING_HREF.dining);
    expect(getStepRoute('ground')).toBe(BOOKING_HREF.ground);
    expect(getStepRoute('review')).toBe(BOOKING_HREF.review);
    expect(String(BOOKING_HREF.seats)).toMatch(/^\//);
  });
});
