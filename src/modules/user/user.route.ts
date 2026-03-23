/**
 * 사용자 관련 라우트
 * 사용자 CRUD, 검색, 조직 변경 등을 처리합니다.
 * TODO: 기존 user 서비스 로직 마이그레이션
 */
import type { FastifyInstance } from 'fastify';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // TODO: GET /users/new-members - 신규 멤버 조회
  // TODO: GET /users/search - 이름으로 사용자 검색
  // TODO: GET /users/accessible - 접근 가능한 사용자 조회 (인증 필요)
  // TODO: PATCH /users/:id/change-organization - 조직 변경
  // TODO: PATCH /users/bulk-change-organization - 일괄 조직 변경
  // TODO: GET /users/:id - 사용자 상세 조회
  // TODO: POST /users - 사용자 생성
  // TODO: POST /users/batch - 사용자 일괄 생성
  // TODO: GET /users - 사용자 목록 조회
  // TODO: PUT /users/:id - 사용자 수정
  // TODO: DELETE /users/:id - 사용자 삭제

  app.log.info('User routes registered (pending implementation)');
}
