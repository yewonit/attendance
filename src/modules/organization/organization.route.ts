import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as orgService from '../../services/organization/organization.service';

const TAG = ['Organizations'] as const;

export async function organizationRoutes(app: FastifyInstance) {
  // --- 특수 경로 (/:id 보다 먼저 등록) ---

  app.get(
    '/member-counts',
    {
      schema: { tags: [...TAG], summary: '전체 조직 멤버 수 조회' },
    },
    async () => {
      const data = await orgService.getAllOrganizationMemberCounts();
      return { data };
    },
  );

  app.get(
    '/:id/members',
    {
      schema: {
        tags: [...TAG],
        summary: '조직 멤버 목록 조회',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      const members = await orgService.getOrganizationMembers(id);
      return { members };
    },
  );

  app.get(
    '/:id/members/roles',
    {
      schema: {
        tags: [...TAG],
        summary: '조직 멤버 역할 포함 조회',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      return orgService.getMembersWithRoles(id);
    },
  );

  // --- CRUD ---

  app.post(
    '/',
    {
      schema: {
        tags: [...TAG],
        summary: '조직 생성',
        body: z.object({
          name: z.string(),
          seasonId: z.number().optional(),
          upperOrganizationId: z.number().optional(),
        }),
      },
    },
    async (req, reply) => {
      const body = req.body as { name: string; seasonId?: number; upperOrganizationId?: number };
      const data = await orgService.createOrganization(body);
      return reply.status(201).send({ data });
    },
  );

  app.get(
    '/',
    {
      schema: {
        tags: [...TAG],
        summary: '조직 목록 또는 필터 옵션 조회',
        querystring: z.object({ filterOptions: z.string().optional() }),
      },
    },
    async (req) => {
      const { filterOptions } = req.query as { filterOptions?: string };
      if (filterOptions) {
        const options = await orgService.getFilterOptions();
        return { data: options };
      }
      const data = await orgService.findOrganizations();
      return { data };
    },
  );

  app.get(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: 'ID로 조직 조회',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      const data = await orgService.findOrganizationById(id);
      return { data };
    },
  );

  app.put(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: '조직 정보 수정',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      const body = req.body as Partial<{ name: string; upperOrganizationId: number }>;
      return orgService.updateOrganization(id, body);
    },
  );

  app.delete(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: '조직 삭제',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      return orgService.deleteOrganization(id);
    },
  );
}
