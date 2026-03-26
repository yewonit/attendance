/**
 * 외부 HTTP 요청 유틸리티
 * 외부 인증 서버와의 통신에 사용됩니다.
 * TODO: 기존 auth 서버 연동 로직 마이그레이션
 */
import { env } from '../config/env';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

/** 외부 인증 서버로 HTTP 요청을 보냅니다. */
export async function authServerRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'POST', body, headers = {} } = options;

  const baseUrl = `http://${env.authServer.host}:${env.authServer.port}`;
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Auth server error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return response.json() as Promise<T>;
}
