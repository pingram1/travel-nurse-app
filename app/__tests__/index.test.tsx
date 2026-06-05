import { render } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';

import Index from '../index';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => <MockText testID="redirect">{href}</MockText>,
}));

describe('Index route', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('redirects unauthenticated users to login', () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect')).toHaveTextContent('/(auth)/login');
  });

  it('redirects authenticated users to booking tab', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'nurse@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'nurse',
        credentialsVerified: true,
        permissions: ['vault:read', 'vault:write'],
      },
    });

    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect')).toHaveTextContent('/(tabs)/booking');
  });
});
