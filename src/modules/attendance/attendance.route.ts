import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as attendanceService from '../../services/attendance/attendance.service';

const TAG = ['Attendances'] as const;
const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function attendanceRoutes(app: FastifyInstance) {
  app.get(
    '/weekly',
    {
      schema: {
        tags: [...TAG],
        summary: '주간 출석 집계',
        querystring: z.object({
          gook: z.string().optional(),
          group: z.string().optional(),
          soon: z.string().optional(),
        }),
      },
    },
    async (req) => {
      const { gook, group, soon } = req.query as { gook?: string; group?: string; soon?: string };
      const data = await attendanceService.getWeeklyAttendanceAggregation(gook, group, soon);
      return { data, error: null };
    },
  );

  app.get(
    '/graph',
    {
      schema: {
        tags: [...TAG],
        summary: '주간 출석 그래프 데이터',
        querystring: z.object({
          gook: z.string().optional(),
          group: z.string().optional(),
          soon: z.string().optional(),
        }),
      },
    },
    async (req) => {
      const { gook, group, soon } = req.query as { gook?: string; group?: string; soon?: string };
      const data = await attendanceService.getWeeklyAttendanceGraph(gook, group, soon);
      return { data, error: null };
    },
  );

  app.get(
    '/continuous',
    {
      schema: {
        tags: [...TAG],
        summary: '연속 출석/결석 현황',
        querystring: z.object({
          gook: z.string().optional(),
          group: z.string().optional(),
          soon: z.string().optional(),
        }),
      },
    },
    async (req) => {
      const { gook, group, soon } = req.query as { gook?: string; group?: string; soon?: string };
      const data = await attendanceService.getContinuousMembers(gook, group, soon);
      return { data, error: null };
    },
  );

  app.get(
    '/trend',
    {
      schema: { tags: [...TAG], summary: '청년예배 출석 트렌드' },
    },
    async () => {
      const data = await attendanceService.getYoungAdultAttendanceTrend();
      return { data, error: null };
    },
  );

  app.get(
    '/sunday/recent/excel',
    {
      schema: {
        tags: [...TAG],
        summary: '최근 일요일 출석 엑셀 다운로드',
        querystring: z.object({ date: z.string().optional() }),
        produces: [XLSX_CONTENT_TYPE],
      },
    },
    async (req, reply) => {
      const { date } = req.query as { date?: string };
      const attendance = await attendanceService.getRecentSundayAttendance(date);
      const buffer = await attendanceService.recentSundayAttendanceToExcel(attendance);

      return reply
        .header('Content-Type', XLSX_CONTENT_TYPE)
        .header('Content-Disposition', 'attachment; filename=recent_sunday_attendance.xlsx')
        .send(buffer);
    },
  );

  app.get(
    '/wednesday/recent/excel',
    {
      schema: {
        tags: [...TAG],
        summary: '최근 수요일 출석 엑셀 다운로드',
        querystring: z.object({ date: z.string().optional() }),
        produces: [XLSX_CONTENT_TYPE],
      },
    },
    async (req, reply) => {
      const { date } = req.query as { date?: string };
      const attendance = await attendanceService.getRecentWednesdayAttendance(date);
      const buffer = await attendanceService.recentWednesdayAttendanceToExcel(attendance);

      return reply
        .header('Content-Type', XLSX_CONTENT_TYPE)
        .header('Content-Disposition', 'attachment; filename=recent_wednesday_attendance.xlsx')
        .send(buffer);
    },
  );
}
