import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('renders label and handles press', () => {
    const onPress = jest.fn();

    render(<Button label="Sign In" onPress={onPress} />);

    fireEvent.press(screen.getByText('Sign In'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state and disables interaction', () => {
    const onPress = jest.fn();

    render(<Button label="Sign In" loading onPress={onPress} />);

    expect(screen.getByText('Loading…')).toBeTruthy();
    fireEvent.press(screen.getByText('Loading…'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
