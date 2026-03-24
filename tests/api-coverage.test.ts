/**
 * API 커버리지 검증 테스트
 * 등록된 모든 라우트에 대해 테스트가 존재하는지 확인합니다.
 * 테스트가 없는 API가 발견되면 실패합니다.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers/build-test-app';

/** 프로젝트에 등록된 전체 API 매니페스트 (HEAD 제외) */
const API_MANIFEST: readonly string[] = [
  // Health
  'GET /health-check',
  // Auth
  'POST /auth/register',
  'POST /auth/login',
  'GET /auth/login',
  'POST /auth/refresh',
  'POST /auth/code',
  'POST /auth/verify',
  'POST /auth/reset-password',
  'GET /auth/users/email',
  'GET /auth/users/name',
  'POST /auth/users/phone-number',
  // Users
  'GET /api/users/new-members',
  'GET /api/users/search',
  'GET /api/users/accessible',
  'PATCH /api/users/:id/change-organization',
  'PATCH /api/users/bulk-change-organization',
  'GET /api/users/:id',
  'POST /api/users',
  'POST /api/users/batch',
  'GET /api/users',
  'PUT /api/users/:id',
  'DELETE /api/users/:id',
  // Activities
  'GET /api/activities/templates',
  'GET /api/activities',
  'POST /api/activities',
  'GET /api/activities/:id',
  'PUT /api/activities/:id',
  'DELETE /api/activities/:id',
  // Organizations
  'GET /api/organizations/member-counts',
  'GET /api/organizations/:id/members',
  'GET /api/organizations/:id/members/roles',
  'POST /api/organizations',
  'GET /api/organizations',
  'GET /api/organizations/:id',
  'PUT /api/organizations/:id',
  'DELETE /api/organizations/:id',
  // Attendances
  'GET /api/attendances/weekly',
  'GET /api/attendances/graph',
  'GET /api/attendances/continuous',
  'GET /api/attendances/trend',
  'GET /api/attendances/sunday/recent/excel',
  'GET /api/attendances/wednesday/recent/excel',
  // Seasons
  'POST /api/seasons',
  'GET /api/seasons/next',
  'GET /api/seasons/all-nations',
  // Cron
  'PUT /api/cron-scheduler/users/new-members',
  'PUT /api/cron-scheduler/users/long-term-absentees',
] as const;

function collectTestedRoutes(): Set<string> {
  const testDir = resolve(__dirname, 'routes');
  const tested = new Set<string>();

  const files = readdirSync(testDir).filter((f) => f.endsWith('.test.ts'));
  for (const file of files) {
    const content = readFileSync(resolve(testDir, file), 'utf-8');
    const regex = /app\.inject\(\{[^}]*method:\s*['"](\w+)['"],\s*url:\s*['"]([^'"]+)['"]/g;
    let m: RegExpExecArray | null;
    m = regex.exec(content);
    while (m !== null) {
      const method = m[1].toUpperCase();
      let url = m[2].split('?')[0];
      url = url.replace(/\/\d+(\/|$)/g, '/:id$1');
      tested.add(`${method} ${url}`);
      m = regex.exec(content);
    }
  }

  return tested;
}

describe('API 커버리지 검증', () => {
  it('매니페스트에 정의된 모든 라우트가 실제 등록되어 있어야 한다', async () => {
    const app = await buildTestApp();

    const unregistered: string[] = [];
    for (const entry of API_MANIFEST) {
      const [method, url] = entry.split(' ');
      const exists = app.hasRoute({ method: method as 'GET', url });
      if (!exists) unregistered.push(entry);
    }
    await app.close();

    if (unregistered.length > 0) {
      expect.fail(
        [
          '매니페스트에 정의되어 있지만 실제 등록되지 않은 라우트:',
          ...unregistered.map((r) => `  - ${r}`),
        ].join('\n'),
      );
    }
  });

  it('모든 API에 대한 테스트가 존재해야 한다', () => {
    const tested = collectTestedRoutes();

    const normalize = (path: string) =>
      path.replace(/:[\w]+/g, ':id').replace(/\/+$/, '');

    const normalizedTested = new Set<string>();
    for (const r of tested) {
      const [method, ...rest] = r.split(' ');
      normalizedTested.add(`${method} ${normalize(rest.join(' '))}`);
    }

    const untested: string[] = [];
    for (const route of API_MANIFEST) {
      const [method, ...rest] = route.split(' ');
      const key = `${method} ${normalize(rest.join(' '))}`;
      if (!normalizedTested.has(key)) {
        untested.push(route);
      }
    }

    if (untested.length > 0) {
      expect.fail(
        [
          '다음 API에 대한 테스트가 없습니다:',
          ...untested.map((r) => `  - ${r}`),
          '',
          `총 ${API_MANIFEST.length}개 API 중 ${untested.length}개 누락`,
        ].join('\n'),
      );
    }

    expect(API_MANIFEST.length).toBeGreaterThan(0);
  });
});
