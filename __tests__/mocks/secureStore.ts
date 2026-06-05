import * as SecureStore from 'expo-secure-store';

export const secureStoreMock = SecureStore as jest.Mocked<typeof SecureStore>;

export function resetSecureStoreMock(): void {
  secureStoreMock.getItemAsync.mockReset();
  secureStoreMock.setItemAsync.mockReset();
  secureStoreMock.deleteItemAsync.mockReset();
}
