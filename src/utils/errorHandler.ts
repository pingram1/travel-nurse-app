import axios, { type AxiosError } from 'axios';

import type { ApiErrorEnvelope } from '@/types/api';

function isAxiosError(value: unknown): value is AxiosError<ApiErrorEnvelope> {
  return axios.isAxiosError(value);
}

function getHeaderRequestId(headers: unknown): string | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const value = (headers as Record<string, unknown>)['X-Request-Id'];
  return typeof value === 'string' ? value : undefined;
}

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode?: number,
    public readonly requestId?: string,
    public readonly fieldErrors?: Record<string, string[]>,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const envelope = error.response?.data;
    const requestId = envelope?.requestId ?? getHeaderRequestId(error.config?.headers);

    if (!error.response) {
      return new AppError(
        'Network connection failed',
        'NETWORK_ERROR',
        undefined,
        requestId,
        undefined,
        error,
      );
    }

    const code = mapStatusToCode(status);
    const message = envelope?.message ?? error.message ?? 'An unexpected error occurred';

    return new AppError(message, code, status, requestId, envelope?.errors, error);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN', undefined, undefined, undefined, error);
  }

  return new AppError(
    'An unexpected error occurred',
    'UNKNOWN',
    undefined,
    undefined,
    undefined,
    error,
  );
}

function mapStatusToCode(status?: number): ErrorCode {
  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 422:
      return 'VALIDATION_ERROR';
    default:
      return status && status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN';
  }
}

export function getUserFacingMessage(error: AppError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect. Check your network and try again.';
    case 'UNAUTHORIZED':
      return 'Your session has expired. Please sign in again.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'VALIDATION_ERROR':
      return error.message || 'Please correct the highlighted fields.';
    case 'SERVER_ERROR':
      return 'Something went wrong on our end. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}
