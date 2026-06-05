import { getNextStep, resolveWorkflowSteps } from '../booking';

describe('booking utils', () => {
  it('prioritizes housing when housing-first is enabled', () => {
    expect(resolveWorkflowSteps(true)[0]).toBe('housing');
    expect(resolveWorkflowSteps(false)[0]).toBe('flights');
  });

  it('returns the next workflow step', () => {
    const steps = resolveWorkflowSteps(true);
    expect(getNextStep(steps, 'housing')).toBe('flights');
  });
});
