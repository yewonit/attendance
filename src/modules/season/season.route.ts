/**
 * 시즌 관련 라우트
 * 시즌 생성, 다음 시즌 조회 등을 처리합니다.
 * TODO: 기존 season 서비스 로직 마이그레이션
 */
import type { FastifyInstance } from 'fastify';

export async function seasonRoutes(app: FastifyInstance): Promise<void> {
  // TODO: POST /seasons - 시즌 생성
  // TODO: GET /seasons/next - 다음 시즌 정보 조회
  // TODO: GET /seasons/all-nations - 전체 시즌 조회

  app.log.info('Season routes registered (pending implementation)');
}
