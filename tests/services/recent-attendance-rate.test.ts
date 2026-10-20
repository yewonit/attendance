import ExcelJS from 'exceljs';
import { describe, expect, it, vi } from 'vitest';

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock('../../src/db', () => ({ db: {}, pool: { execute } }));
vi.mock('../../src/services/season/season.service', () => ({
  getCurrentSeasonId: vi.fn().mockResolvedValue(7),
}));

import {
  getRecentAttendanceRate,
  recentAttendanceRateToExcel,
} from '../../src/services/attendance/modules/recent-attendance-rate';

const row = (
  organization_name: string,
  user_id: number,
  user_name: string,
  activity_name: string | null,
  attendance_status: string | null,
  count: number,
) => ({ organization_name, user_id, user_name, activity_name, attendance_status, count });

describe('getRecentAttendanceRate', () => {
  it('예배별 출석/결석 횟수를 사용자당 한 행으로 펼치고 출석률을 계산한다', async () => {
    execute.mockResolvedValueOnce([
      [
        row('1국_김그룹_이순', 1, '홍길동', '주일2부예배', '출석', 2),
        row('1국_김그룹_이순', 1, '홍길동', '주일3부예배', '출석', 1),
        row('1국_김그룹_이순', 1, '홍길동', '주일3부예배', '결석', 1),
        row('1국_김그룹_이순', 1, '홍길동', '청년예배', '출석', 2),
        row('1국_김그룹_이순', 1, '홍길동', '청년예배', '결석', 1),
        // 기간 밖 출석 기록 (activity 조인 실패) — 무시되어야 함
        row('1국_김그룹_이순', 1, '홍길동', null, '출석', 10),
        // 출석 기록이 없는 사용자
        row('1국_김그룹_이순', 2, '김철수', null, null, 0),
      ],
    ]);

    const result = await getRecentAttendanceRate(3);

    expect(execute.mock.calls[0][1][2]).toBe(7);
    expect(result).toEqual([
      {
        organization_name: '1국_김그룹_이순',
        user_name: '홍길동',
        '대예배 출석': 3,
        '대예배 결석': 1,
        '대예배 출석률(%)': 75,
        '청년예배 출석': 2,
        '청년예배 결석': 1,
        '청년예배 출석률(%)': 66.7,
        '수요청년예배 출석': 0,
        '수요청년예배 결석': 0,
        '수요청년예배 출석률(%)': null,
        '금요청년예배 출석': 0,
        '금요청년예배 결석': 0,
        '금요청년예배 출석률(%)': null,
      },
      {
        organization_name: '1국_김그룹_이순',
        user_name: '김철수',
        '대예배 출석': 0,
        '대예배 결석': 0,
        '대예배 출석률(%)': null,
        '청년예배 출석': 0,
        '청년예배 결석': 0,
        '청년예배 출석률(%)': null,
        '수요청년예배 출석': 0,
        '수요청년예배 결석': 0,
        '수요청년예배 출석률(%)': null,
        '금요청년예배 출석': 0,
        '금요청년예배 결석': 0,
        '금요청년예배 출석률(%)': null,
      },
    ]);
  });

  it('같은 사용자라도 소속 조직이 다르면 조직별로 따로 집계한다', async () => {
    execute.mockResolvedValueOnce([
      [
        row('1국_김그룹', 1, '홍길동', '청년예배', '출석', 1),
        row('1국_김그룹_이순', 1, '홍길동', '청년예배', '결석', 1),
      ],
    ]);

    const result = await getRecentAttendanceRate(1);

    expect(result.map((r) => [r.organization_name, r['청년예배 출석률(%)']])).toEqual([
      ['1국_김그룹', 100],
      ['1국_김그룹_이순', 0],
    ]);
  });
});

describe('recentAttendanceRateToExcel', () => {
  it('전체 시트와 조직별 시트에 한글 헤더로 출석률을 기록한다', async () => {
    execute.mockResolvedValueOnce([
      [
        row('1국_김그룹_이순', 1, '홍길동', '청년예배', '출석', 3),
        row('1국_김그룹_박순', 2, '김철수', '청년예배', '결석', 1),
      ],
    ]);
    const buffer = await recentAttendanceRateToExcel(await getRecentAttendanceRate(3));

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    expect(workbook.worksheets.map((ws) => ws.name)).toEqual([
      '전체',
      '1국_김그룹_이순',
      '1국_김그룹_박순',
    ]);
    const sheet = workbook.getWorksheet('전체');
    expect(sheet?.getRow(1).values).toEqual([
      undefined,
      '조직',
      '이름',
      '대예배 출석',
      '대예배 결석',
      '대예배 출석률(%)',
      '청년예배 출석',
      '청년예배 결석',
      '청년예배 출석률(%)',
      '수요청년예배 출석',
      '수요청년예배 결석',
      '수요청년예배 출석률(%)',
      '금요청년예배 출석',
      '금요청년예배 결석',
      '금요청년예배 출석률(%)',
    ]);
    expect(sheet?.getRow(2).getCell(8).value).toBe(100);
    expect(sheet?.getRow(3).getCell(8).value).toBe(0);
  });
});
