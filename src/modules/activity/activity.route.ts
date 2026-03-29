import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as activityService from '../../services/activity/activity.service';

const TAG = ['Activities'] as const;

/** ISO 8601 문자열을 Date 객체로 변환하는 Zod 스키마 */
const zDateTime = z.string().datetime({ offset: true }).transform((s) => new Date(s));

/** 활동 + 출석 요청 바디 스키마 — ISO 문자열을 Date 객체로 자동 변환 */
const activityBodySchema = z.object({
  activityData: z.object({
    startDateTime: zDateTime,
    endDateTime: zDateTime,
    location: z.string().optional(),
    notes: z.string().optional(),
    name: z.string().optional(),
    activityCategory: z.string().optional(),
  }),
  attendances: z.array(
    z.object({
      userId: z.number(),
      status: z.string(),
      checkInTime: zDateTime.nullable().optional(),
      checkOutTime: zDateTime.nullable().optional(),
      note: z.string().optional(),
    }),
  ),
  imageInfo: z
    .object({
      url: z.string(),
      fileName: z.string(),
      fileSize: z.number().optional(),
      fileType: z.string().optional(),
    })
    .nullish(),
});

export async function activityRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>();
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

  typed.post(
    '/',
    {
      schema: {
        tags: [...TAG],
        summary: '활동 및 출석 기록 생성',
        querystring: z.object({
          organizationId: z.coerce.number(),
          activityTemplateId: z.coerce.number(),
        }),
        body: activityBodySchema,
      },
    },
    async (req, reply) => {
      await activityService.recordActivityAndAttendance(
        req.query.organizationId,
        req.query.activityTemplateId,
        req.body,
      );
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

  typed.put(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: '활동 및 출석 수정',
        params: z.object({ id: z.coerce.number() }),
        body: activityBodySchema,
      },
    },
    async (req) => {
      await activityService.updateActivityAndAttendance(req.params.id, req.body);
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
