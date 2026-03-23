/**
 * 조직 관련 라우트
 * 조직 CRUD, 멤버 조회, 역할 조회 등을 처리합니다.
 * TODO: 기존 organization 서비스 로직 마이그레이션
 */
import type { FastifyInstance } from 'fastify';

export async function organizationRoutes(app: FastifyInstance): Promise<void> {
  // TODO: GET /organizations/member-counts - 조직별 멤버 수
  // TODO: GET /organizations/:id/members - 조직 멤버 조회
  // TODO: GET /organizations/:id/members/roles - 조직 멤버 역할 조회
  // TODO: POST /organizations - 조직 생성
  // TODO: GET /organizations - 조직 목록 조회
  // TODO: GET /organizations/:id - 조직 상세 조회
  // TODO: PUT /organizations/:id - 조직 수정
  // TODO: DELETE /organizations/:id - 조직 삭제

  app.log.info('Organization routes registered (pending implementation)');
}
