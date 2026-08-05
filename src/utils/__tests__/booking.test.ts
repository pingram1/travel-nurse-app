import { getNextStep, resolveWorkflowSteps } from '../booking';

describe('booking utils', () => {
  it('prioritizes housing when housing-first is enabled', () => {
    expect(resolveWorkflowSteps(true)[0]).toBe('housing');
    expect(resolveWorkflowSteps(false)[0]).toBe('flights');
  });

  it('includes seats, dining, and cars in the full workflow', () => {
    const steps = resolveWorkflowSteps(true);
    expect(steps).toContain('seats');
    expect(steps).toContain('dining');
    expect(steps).toContain('cars');
    expect(steps[steps.length - 1]).toBe('review');
  });

  it('returns the next workflow step', () => {
    const steps = resolveWorkflowSteps(true);
    expect(getNextStep(steps, 'housing')).toBe('flights');
    expect(getNextStep(steps, 'flights')).toBe('seats');
  });
});
