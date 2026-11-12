/**
 * JWT 발급·검증 (구 account 서비스의 /v1/token, /v1/verify, /v1/refresh 대체)
 *
 * - 액세스·리프레시 토큰을 type 클레임으로 구분합니다. 리프레시 토큰을 액세스 토큰으로 쓸 수 없습니다.
 * - 환경별 서명 키와 audience를 써서 dev에서 받은 토큰이 운영에서 통하지 않습니다.
 * - 리프레시 토큰은 한 번 쓰면 짧은 유예 후 폐기됩니다(회전).
 * - 비밀번호 재설정 시 그 이전에 발급된 토큰을 모두 무효화할 수 있습니다.
 */
import { randomUUID } from 'node:crypto';
import { SignJWT, errors as joseErrors, jwtVerify } from 'jose';
import { env } from '../../config/env';
import { authStore } from './auth.store';

export const ACCESS_TOKEN_TTL = 60 * 60 * 3;
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7;
const REFRESH_TOKEN_REUSE_GRACE = 30;
const MIN_SECRET_LENGTH = 32;

const ISSUER = 'attendance';
const AUDIENCE = `attendance:${env.nodeEnv}`;

type TokenType = 'access' | 'refresh';

export interface TokenSubject {
  email: string;
  name: string;
}

export interface TokenPair {
  accessToken: string;
  /** 토큰 수명(초) — 구 account 서비스 응답 형식을 그대로 유지합니다. */
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

let secretKey: Uint8Array | undefined;

function getSecretKey(): Uint8Array {
  if (!secretKey) {
    const secret = env.auth.jwtSecret;
    if (!secret || secret.length < MIN_SECRET_LENGTH) {
      throw new Error(`JWT 서명 키가 없거나 ${MIN_SECRET_LENGTH}자보다 짧습니다. (${env.nodeEnv})`);
    }
    secretKey = new TextEncoder().encode(secret);
  }
  return secretKey;
}

/** 서명 키 설정을 확인합니다. 서버 시작 시 호출합니다. */
export function assertJwtSecretConfigured(): void {
  getSecretKey();
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

async function signToken(subject: TokenSubject, type: TokenType, ttl: number, jti: string) {
  const issuedAt = nowSeconds();
  return new SignJWT({ email: subject.email, name: subject.name, type })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setJti(jti)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + ttl)
    .sign(getSecretKey());
}

/** 서명·만료·용도·세션 무효화 여부를 모두 확인합니다. 유효하지 않으면 null을 반환합니다. */
async function verifyToken(
  token: string,
  expectedType: TokenType,
): Promise<(TokenSubject & { jti: string }) | null> {
  let payload: Awaited<ReturnType<typeof jwtVerify>>['payload'];
  try {
    ({ payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
      requiredClaims: ['jti', 'iat', 'exp'],
    }));
  } catch (error) {
    if (error instanceof joseErrors.JOSEError) return null;
    throw error;
  }

  const { email, name, type, jti, iat } = payload;
  if (type !== expectedType || typeof email !== 'string' || typeof name !== 'string') return null;
  if (typeof jti !== 'string' || typeof iat !== 'number') return null;

  const validAfter = await authStore.getSessionsValidAfter(normalizeEmail(email));
  if (iat < validAfter) return null;

  return { email, name, jti };
}

/** 액세스·리프레시 토큰 쌍을 발급합니다. 비밀번호 확인 등 인증을 마친 뒤에만 호출해야 합니다. */
export async function issueTokens(subject: TokenSubject): Promise<TokenPair> {
  const refreshJti = randomUUID();
  const [accessToken, refreshToken] = await Promise.all([
    signToken(subject, 'access', ACCESS_TOKEN_TTL, randomUUID()),
    signToken(subject, 'refresh', REFRESH_TOKEN_TTL, refreshJti),
  ]);
  await authStore.saveRefreshToken(refreshJti, REFRESH_TOKEN_TTL);

  return {
    accessToken,
    accessTokenExpiresAt: ACCESS_TOKEN_TTL,
    refreshToken,
    refreshTokenExpiresAt: REFRESH_TOKEN_TTL,
  };
}

/** 액세스 토큰을 검증합니다. */
export async function verifyAccessToken(token: string): Promise<TokenSubject | null> {
  const verified = await verifyToken(token, 'access');
  return verified && { email: verified.email, name: verified.name };
}

/** 리프레시 토큰을 검증하고 사용 처리합니다. 새 토큰 발급은 호출하는 쪽에서 합니다. */
export async function consumeRefreshToken(token: string): Promise<TokenSubject | null> {
  const verified = await verifyToken(token, 'refresh');
  if (!verified) return null;
  if (!(await authStore.useRefreshToken(verified.jti, REFRESH_TOKEN_REUSE_GRACE))) return null;
  return { email: verified.email, name: verified.name };
}

/** 지금까지 발급된 해당 사용자의 모든 토큰을 무효화합니다. */
export async function revokeAllSessions(email: string): Promise<void> {
  // iat가 초 단위라 같은 초에 발급된 토큰까지 막으려면 다음 초부터 유효하게 한다.
  // 가장 오래 사는 리프레시 토큰이 만료될 때까지만 기록을 유지하면 된다.
  await authStore.revokeSessions(normalizeEmail(email), nowSeconds() + 1, REFRESH_TOKEN_TTL);
}
