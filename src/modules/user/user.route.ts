import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getAllNewMembers, getMembersWithFilters } from '../../services/user/user-filter.service';
import {
  changeOrganization,
  getAccessibleOrganizations,
} from '../../services/user/user-role.service';
import * as userService from '../../services/user/user.service';

const TAG = ['Users'] as const;

export async function userRoutes(app: FastifyInstance) {
  // --- 특수 경로 (CRUD보다 먼저 등록) ---

  app.get(
    '/new-members',
    {
      schema: { tags: [...TAG], summary: '새가족 목록 조회' },
    },
    async () => {
      const data = await getAllNewMembers();
      return { data };
    },
  );

  app.get(
    '/search',
    {
      schema: {
        tags: [...TAG],
        summary: '이름으로 회원 검색',
        querystring: z.object({ name: z.string() }),
      },
    },
    async (req, reply) => {
      const { name } = req.query as { name: string };
      if (!name) return reply.status(400).send({ success: false, message: '이름을 입력해주세요.' });

      const members = await userService.searchMembersByName(name);
      if (members.length === 0)
        return reply.status(404).send({ success: false, message: '해당 이름의 교인이 없습니다.' });
      return { success: true, data: members };
    },
  );

  app.get(
    '/accessible',
    {
      schema: {
        tags: [...TAG],
        summary: '접근 가능한 조직 목록 조회',
        security: [{ bearerAuth: [] }],
      },
      preHandler: [app.authenticate],
    },
    async (req) => {
      const { email, name } = req.auth;
      return getAccessibleOrganizations(email, name);
    },
  );

  app.patch(
    '/:id/change-organization',
    {
      schema: {
        tags: [...TAG],
        summary: '사용자 조직 변경',
        params: z.object({ id: z.coerce.number() }),
        body: z.object({ organizationId: z.number(), roleName: z.string() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      const { organizationId, roleName } = req.body as { organizationId: number; roleName: string };
      await changeOrganization(id, organizationId, roleName);
      return { message: 'success' };
    },
  );

  app.patch(
    '/bulk-change-organization',
    {
      schema: {
        tags: [...TAG],
        summary: '사용자 일괄 조직 변경',
        body: z.object({
          data: z.array(
            z.object({ id: z.number(), organizationId: z.number(), roleName: z.string() }),
          ),
        }),
      },
    },
    async (req) => {
      const { data } = req.body as {
        data: { id: number; organizationId: number; roleName: string }[];
      };
      for (const item of data) {
        await changeOrganization(item.id, item.organizationId, item.roleName);
      }
      return { message: 'success' };
    },
  );

  // --- CRUD ---

  app.get(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: 'ID로 사용자 조회',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      const data = await userService.findUserById(id);
      return { data };
    },
  );

  app.post(
    '/',
    {
      schema: {
        tags: [...TAG],
        summary: '새로운 사용자 생성',
        body: z.object({
          userData: z.object({
            name: z.string(),
            gender: z.string(),
            nameSuffix: z.string().optional(),
            birthDate: z.string().optional(),
            phoneNumber: z.string(),
          }),
          organizationId: z.number(),
        }),
      },
    },
    async (req, reply) => {
      const { userData, organizationId } = req.body as {
        userData: {
          name: string;
          gender: string;
          nameSuffix?: string;
          birthDate?: string;
          phoneNumber: string;
        };
        organizationId: number;
      };
      const data = await userService.createUser({
        name: userData.name,
        gender: userData.gender,
        nameSuffix: userData.nameSuffix,
        birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
        phoneNumber: userData.phoneNumber,
        organizationId,
      });
      return reply.status(201).send(data);
    },
  );

  app.post(
    '/batch',
    {
      schema: {
        tags: [...TAG],
        summary: '사용자 일괄 생성',
        body: z.object({
          users: z.array(
            z.object({
              name: z.string(),
              gender: z.string(),
              nameSuffix: z.string().optional(),
              birthDate: z.string().optional(),
              phone: z.string().optional(),
              email: z.string().nullish(),
              organizationId: z.number(),
            }),
          ),
        }),
      },
    },
    async (req, reply) => {
      const { users: userList } = req.body as {
        users: {
          name: string;
          gender: string;
          nameSuffix?: string;
          birthDate?: string;
          phone?: string;
          email?: string | null;
          organizationId: number;
        }[];
      };
      const data = await userService.createUsers(
        userList.map((u) => ({
          ...u,
          nameSuffix: u.nameSuffix,
          birthDate: u.birthDate ? new Date(u.birthDate) : null,
        })),
      );
      return reply.status(201).send(data);
    },
  );

  app.get(
    '/',
    {
      schema: {
        tags: [...TAG],
        summary: '사용자 목록 조회 (필터/페이지네이션 지원)',
        querystring: z.object({
          search: z.string().optional(),
          department: z.string().optional(),
          group: z.string().optional(),
          team: z.string().optional(),
          page: z.coerce.number().optional(),
          limit: z.coerce.number().optional(),
        }),
      },
    },
    async (req) => {
      const { search, department, group, team, page, limit } = req.query as {
        search?: string;
        department?: string;
        group?: string;
        team?: string;
        page?: number;
        limit?: number;
      };

      const hasFilters =
        search?.trim() ||
        department?.trim() ||
        group?.trim() ||
        team?.trim() ||
        (page && page > 0) ||
        (limit && limit > 0);

      if (hasFilters) {
        const result = await getMembersWithFilters({
          search,
          department,
          group,
          team,
          page,
          limit,
        });
        return { data: { members: result.members, pagination: result.pagination } };
      }

      const data = await userService.findAllUsers();
      return { data };
    },
  );

  app.put(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: '사용자 정보 수정',
        params: z.object({ id: z.coerce.number() }),
        body: z.object({
          userData: z.object({
            name: z.string().optional(),
            nameSuffix: z.string().optional(),
            email: z.string().optional(),
            password: z.string().optional(),
            gender: z.string().optional(),
            birthDate: z.string().optional(),
            phone: z.string().optional(),
            organizationId: z.number().optional(),
          }),
        }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      const { userData } = req.body as { userData: Record<string, unknown> };
      const updated = await userService.updateUser(id, {
        ...userData,
        birthDate: userData.birthDate ? new Date(userData.birthDate as string) : undefined,
      } as Parameters<typeof userService.updateUser>[1]);
      return updated;
    },
  );

  app.delete(
    '/:id',
    {
      schema: {
        tags: [...TAG],
        summary: '사용자 삭제',
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: number };
      await userService.deleteUser(id);
      return { message: 'success' };
    },
  );
}
