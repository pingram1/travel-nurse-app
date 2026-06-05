import { AppError, normalizeError } from '@/utils/errorHandler';

describe('api client error normalization', () => {
  it('maps axios 401 responses to UNAUTHORIZED', () => {
    const error = normalizeError({
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 401,
        data: {
          success: false,
          message: 'Invalid credentials',
          code: 'AUTH_FAILED',
          requestId: 'req-1',
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
      config: { headers: { 'X-Request-Id': 'req-1' } },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.statusCode).toBe(401);
  });
});
