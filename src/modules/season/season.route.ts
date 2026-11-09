import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../db';
import { createNewSeason } from '../../services/season/modules/create-new-season';
import { createOrganizationAndUserRole } from '../../services/season/modules/create-organization-and-user-role';
import { deleteBeforeCreateOrganization } from '../../services/season/modules/delete-before-create';
import { validateNewSeasonData } from '../../services/season/modules/validate';
import { getAllNationsOrgList, getNextOrganization } from '../../services/season/season.service';
import { PERMISSION_CODES } from '../../services/shared/constants';

const TAG = ['Seasons'] as const;

export async function seasonRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      schema: {
        tags: [...TAG],
        summary: '새 회기 데이터 일괄 생성',
        security: [{ bearerAuth: [] }],
        body: z.object({
          data: z.array(
            z.object({
              gook: z.string(),
              group: z.string(),
              soon: z.string(),
              name: z.string(),
              nameSuffix: z.string().optional(),
              phoneNumber: z.string().optional(),
              role: z.string().optional(),
              birthDate: z.string().optional(),
            }),
          ),
        }),
      },
      // 다음 회기 조직/직분을 통째로 재생성하므로 소속/직분 변경 권한을 요구합니다.
      preHandler: [
        app.authenticate,
        app.requirePermission(PERMISSION_CODES.MEMBER_MANAGEMENT_CONTROL),
      ],
    },
    async (req, reply) => {
      const { data } = req.body as { data: Parameters<typeof validateNewSeasonData>[0] };

      const validatedData = await validateNewSeasonData(data);
      const seasonId = await createNewSeason();

      await db.transaction(async (tx) => {
        await deleteBeforeCreateOrganization(seasonId, tx);
        await createOrganizationAndUserRole(validatedData, seasonId, tx);
      });

      return reply.status(201).send({ data: 'success' });
    },
  );

  app.get(
    '/next',
    {
      schema: {
        tags: [...TAG],
        summary: '다음 회기 소속 조직 조회',
        querystring: z.object({
          name: z.string().optional(),
          userId: z.coerce.number().optional(),
        }),
      },
    },
    async (req) => {
      const { name, userId } = req.query as { name?: string; userId?: number };
      const result = await getNextOrganization(name, userId);
      return { data: result };
    },
  );

  app.get(
    '/all-nations',
    {
      schema: { tags: [...TAG], summary: '올네이션스 순 리스트 조회' },
    },
    async () => {
      const result = await getAllNationsOrgList();
      return { data: result };
    },
  );
}
