import { render, screen } from '@testing-library/react-native';

import { buildStubSafetyRating } from '@/services/api/safetyService';
import { SafetyBadge } from '../SafetyBadge';

describe('SafetyBadge', () => {
  it('renders overall safety grade', () => {
    const rating = buildStubSafetyRating({
      facilityId: 'test-1',
      facilityName: 'Test Hospital',
      zipCode: '97201',
    }).data;

    render(<SafetyBadge rating={rating} />);

    expect(screen.getByText(`Safety Grade: ${rating.overallGrade}`)).toBeTruthy();
  });
});
