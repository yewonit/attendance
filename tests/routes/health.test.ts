import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/build-test-app';

let app: FastifyInstance;

beforeAll(async () => { app = await buildTestApp(); });
afterAll(async () => { await app.close(); });

describe('GET /health-check', () => {
  it('200 OK를 반환한다', async () => {
    const res = await app.inject({ method: 'GET', url: '/health-check' });
    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe('OK');
  });
});
