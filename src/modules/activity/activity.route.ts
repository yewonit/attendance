/**
 * 활동 관련 라우트
 * 활동 CRUD 및 템플릿 조회를 처리합니다.
 * TODO: 기존 activity 서비스 로직 마이그레이션
 */
import type { FastifyInstance } from 'fastify';

export async function activityRoutes(app: FastifyInstance): Promise<void> {
  // TODO: GET /activities - 활동 목록 조회
  // TODO: POST /activities - 활동 생성
  // TODO: GET /activities/templates - 활동 템플릿 조회
  // TODO: GET /activities/:id - 활동 상세 조회
  // TODO: PUT /activities/:id - 활동 수정
  // TODO: DELETE /activities/:id - 활동 삭제

  app.log.info('Activity routes registered (pending implementation)');
}
