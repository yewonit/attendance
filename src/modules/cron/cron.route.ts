/**
 * 크론 스케줄러 라우트
 * 신규 멤버 업데이트, 장기 결석자 처리 등 예약 작업을 트리거합니다.
 * TODO: 기존 cron_scheduler 로직 마이그레이션
 */
import type { FastifyInstance } from 'fastify';

export async function cronRoutes(app: FastifyInstance): Promise<void> {
  // TODO: PUT /cron-scheduler/users/new-members - 신규 멤버 상태 업데이트
  // TODO: PUT /cron-scheduler/users/long-term-absentees - 장기 결석자 처리

  app.log.info('Cron routes registered (pending implementation)');
}
