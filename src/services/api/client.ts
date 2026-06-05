import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { APP_CONFIG } from '@/constants/config';
import { secureStorage, SECURE_STORAGE_KEYS } from '@/services/secure-storage';
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '@/types/api';
import { AppError, normalizeError } from '@/utils/errorHandler';
import { generateRequestId } from '@/utils/uuid';

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: APP_CONFIG.apiBaseUrl,
    timeout: APP_CONFIG.apiTimeoutMs,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use(async (config) => {
    const token = await secureStorage.get(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Request-Id'] = generateRequestId();
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorEnvelope>) => {
      const appError = normalizeError(error);
      return Promise.reject(appError);
    },
  );

  return client;
}

export const apiClient = createApiClient();

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiSuccessEnvelope<T>> {
  try {
    const response = await apiClient.get<ApiSuccessEnvelope<T>>(url, config);
    return response.data;
  } catch (error) {
    throw error instanceof AppError ? error : normalizeError(error);
  }
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<ApiSuccessEnvelope<T>> {
  try {
    const response = await apiClient.post<ApiSuccessEnvelope<T>>(url, body, config);
    return response.data;
  } catch (error) {
    throw error instanceof AppError ? error : normalizeError(error);
  }
}
