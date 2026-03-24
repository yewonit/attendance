import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as activityService from '../../services/activity/activity.service';

const TAG = ['Activities'] as const;

export async function activityRoutes(app: FastifyInstance) {
  app.get(
    '/templates',
    {
      schema: { tags: [...TAG], summary: '활동 템플릿 목록 조회' },
    },
    async () => {
      return { data: activityService.getActivityTemplates(), error: null };
    },
  );

  app.get(
    '/',
    {
      schema: {
        tags: [...TAG],
        summary: '조직별 활동 목록 조회',
        querystring: z.object({ organizationId: z.coerce.number() }),
      },
    },
    async (req) => {
      const { organizationId } = req.query as { organizationId: number };
      const data = await activityService.getAllOrganizationActivities(organizationId);
      return { data, error: null };
    },
  );

  app.post(
    '/',
    {
      schema: {
        tags: [...TAG],
        summary: '활동 및 출석 기록 생성',
        querystring: z.object({
          organizationId: z.coerce.number(),
          activityTemplateId: z.coerce.number(),
        }),
      },
    },
    async (req, reply) => {
      const { organizationId, activityTemplateId } = req.query as {
        organizationId: number;
        activityTemplateId: number;
      };
      const data = req.body as Parameters<typeof activityService.recordActivityAndAttendance>[2];
      await activityService.recordActivityAndAttendance(organizationId, activityTemplateId, data);
      return reply.status(201).send({ data: 'success', error: null });
    },
  );

  app.get(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: '활동 상세 조회',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      const data = await activityService.getActivityDetails(id);
      return { data, error: null };
    },
  );

  app.put(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: '활동 및 출석 수정',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      const data = req.body as Parameters<typeof activityService.updateActivityAndAttendance>[1];
      await activityService.updateActivityAndAttendance(id, data);
      return { data: 'success', error: null };
    },
  );

  app.delete(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: '활동 삭제',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      await activityService.deleteActivityAndAttendance(id);
      return { data: 'success', error: null };
    },
  );
}
