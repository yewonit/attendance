import { SignJWT } from 'jose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  consumeRefreshToken,
  issueTokens,
  revokeAllSessions,
  verifyAccessToken,
} from '../../src/services/auth/token.service';
import { resetMemoryAuthStore } from '../helpers/memory-auth-store';

vi.mock('../../src/services/auth/auth.store', async () => ({
  authStore: (await import('../helpers/memory-auth-store')).memoryAuthStore,
}));

const subject = { email: 'User@Example.com', name: '테스트' };
const secret = new TextEncoder().encode(process.env.LOCAL_JWT_SECRET);

async function forge(
  claims: Record<string, unknown>,
  options: { audience?: string; key?: Uint8Array; ttl?: number } = {},
) {
  const now = Math.floor(Date.now() / 1000);
  let jwt = new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('attendance')
    .setJti('forged')
    .setIssuedAt(now)
    .setExpirationTime(now + (options.ttl ?? 3600));
  if (options.audience !== undefined) jwt = jwt.setAudience(options.audience);
  return jwt.sign(options.key ?? secret);
}

beforeEach(() => {
  resetMemoryAuthStore();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-12T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('token.service', () => {
  it('발급한 액세스 토큰을 검증해 email/name을 돌려준다', async () => {
    const tokens = await issueTokens(subject);
    expect(tokens.accessTokenExpiresAt).toBe(60 * 60 * 3);
    expect(tokens.refreshTokenExpiresAt).toBe(60 * 60 * 24 * 7);
    await expect(verifyAccessToken(tokens.accessToken)).resolves.toEqual(subject);
  });

  it('액세스·리프레시 토큰을 서로 바꿔 쓸 수 없다', async () => {
    const tokens = await issueTokens(subject);
    await expect(verifyAccessToken(tokens.refreshToken)).resolves.toBeNull();
    await expect(consumeRefreshToken(tokens.accessToken)).resolves.toBeNull();
  });

  it('위조·변조되거나 형식이 다른 토큰을 거부한다', async () => {
    const { accessToken } = await issueTokens(subject);
    const [header, payload, signature] = accessToken.split('.');
    const tampered = `${header}.${payload}.${signature.slice(0, -2)}xx`;
    const otherKey = new TextEncoder().encode('another-secret-0123456789abcdefghijkl');
    const unsigned = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${payload}.`;

    await expect(verifyAccessToken(tampered)).resolves.toBeNull();
    await expect(verifyAccessToken(unsigned)).resolves.toBeNull();
    await expect(verifyAccessToken('not-a-jwt')).resolves.toBeNull();
    await expect(
      verifyAccessToken(
        await forge(
          { ...subject, type: 'access' },
          { audience: 'attendance:local', key: otherKey },
        ),
      ),
    ).resolves.toBeNull();
  });

  it('다른 환경(audience)용 토큰과 예전 account 형식 토큰을 거부한다', async () => {
    const prodToken = await forge(
      { ...subject, type: 'access' },
      { audience: 'attendance:production' },
    );
    const legacyToken = await forge(subject); // type·audience 없음
    await expect(verifyAccessToken(prodToken)).resolves.toBeNull();
    await expect(verifyAccessToken(legacyToken)).resolves.toBeNull();
  });

  it('만료된 액세스 토큰을 거부한다', async () => {
    const { accessToken } = await issueTokens(subject);
    vi.setSystemTime(Date.now() + (60 * 60 * 3 + 1) * 1000);
    await expect(verifyAccessToken(accessToken)).resolves.toBeNull();
  });

  it('리프레시 토큰은 사용 후 30초 유예가 지나면 다시 쓸 수 없다', async () => {
    const { refreshToken } = await issueTokens(subject);
    await expect(consumeRefreshToken(refreshToken)).resolves.toEqual(subject);

    // 여러 탭이 동시에 갱신하는 경우를 위한 유예
    vi.setSystemTime(Date.now() + 10_000);
    await expect(consumeRefreshToken(refreshToken)).resolves.toEqual(subject);

    vi.setSystemTime(Date.now() + 21_000);
    await expect(consumeRefreshToken(refreshToken)).resolves.toBeNull();
  });

  it('저장소에 없는 리프레시 토큰은 서명이 맞아도 거부한다', async () => {
    const forged = await forge({ ...subject, type: 'refresh' }, { audience: 'attendance:local' });
    await expect(consumeRefreshToken(forged)).resolves.toBeNull();
  });

  it('세션 무효화 이전(같은 초 포함)에 발급된 토큰만 거부한다', async () => {
    const before = await issueTokens(subject);
    vi.setSystemTime(Date.now() + 5_000);
    const sameSecond = await issueTokens(subject);

    await revokeAllSessions('user@example.com ');
    await expect(verifyAccessToken(before.accessToken)).resolves.toBeNull();
    await expect(consumeRefreshToken(before.refreshToken)).resolves.toBeNull();
    await expect(verifyAccessToken(sameSecond.accessToken)).resolves.toBeNull();

    vi.setSystemTime(Date.now() + 1_000);
    const after = await issueTokens(subject);
    await expect(verifyAccessToken(after.accessToken)).resolves.toEqual(subject);
    await expect(consumeRefreshToken(after.refreshToken)).resolves.toEqual(subject);
  });
});
