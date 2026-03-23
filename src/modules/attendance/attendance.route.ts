/**
 * 출석 관련 라우트
 * 주간 출석, 출석 그래프, 연속 출석, 트렌드, 엑셀 다운로드 등을 처리합니다.
 * TODO: 기존 attendance 서비스 로직 마이그레이션
 */
import type { FastifyInstance } from 'fastify';

export async function attendanceRoutes(app: FastifyInstance): Promise<void> {
  // TODO: GET /attendances/weekly - 주간 출석 현황
  // TODO: GET /attendances/graph - 출석 그래프 데이터
  // TODO: GET /attendances/continuous - 연속 출석 멤버
  // TODO: GET /attendances/trend - 출석 트렌드
  // TODO: GET /attendances/sunday/recent/excel - 주일 출석 엑셀 다운로드
  // TODO: GET /attendances/wednesday/recent/excel - 수요일 출석 엑셀 다운로드

  app.log.info('Attendance routes registered (pending implementation)');
}
