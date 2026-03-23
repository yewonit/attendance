/**
 * 인증 관련 라우트
 * 로그인, 회원가입, 토큰 갱신, 비밀번호 재설정 등을 처리합니다.
 * TODO: 기존 auth 서비스 로직 마이그레이션
 */
import type { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // TODO: POST /auth/register - 회원가입
  // TODO: POST /auth/login - 로그인
  // TODO: GET /auth/login - 토큰 기반 로그인
  // TODO: POST /auth/refresh - 토큰 갱신
  // TODO: POST /auth/code - 인증 코드 발송
  // TODO: POST /auth/verify - 인증 코드 검증
  // TODO: POST /auth/reset-password - 비밀번호 재설정
  // TODO: GET /auth/users/email - 이메일로 사용자 조회
  // TODO: GET /auth/users/name - 이름으로 사용자 조회
  // TODO: POST /auth/users/phone-number - 전화번호로 사용자 조회

  app.log.info('Auth routes registered (pending implementation)');
}
