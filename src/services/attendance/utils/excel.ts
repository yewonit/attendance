/** 출석 현황 데이터를 엑셀 파일(버퍼)로 변환합니다. */
import ExcelJS from 'exceljs';

interface AttendanceRow {
  organization_name: string;
  user_name: string;
  [key: string]: string | number | null;
}

const COLUMN_HEADER_MAP: Record<string, string> = {
  organization_name: '조직',
  user_name: '이름',
};

/**
 * 출석 현황 배열을 엑셀 버퍼로 변환합니다.
 * - "전체" 시트 + 각 조직별 시트를 생성합니다.
 */
export async function attendanceToExcel(attendanceData: AttendanceRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  if (attendanceData.length === 0) {
    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  const columns = buildColumns(attendanceData[0]);

  addSheet(workbook, '전체', columns, attendanceData);

  const grouped = groupByOrganization(attendanceData);
  for (const [orgName, rows] of Object.entries(grouped)) {
    addSheet(workbook, orgName, columns, rows);
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function buildColumns(sample: AttendanceRow): Partial<ExcelJS.Column>[] {
  return Object.keys(sample).map((key) => ({
    header: COLUMN_HEADER_MAP[key] ?? key,
    key,
    width: 20,
  }));
}

function addSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: Partial<ExcelJS.Column>[],
  data: AttendanceRow[],
) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns;
  for (const row of data) sheet.addRow(row);
  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: 'middle', horizontal: 'center' };
}

function groupByOrganization(data: AttendanceRow[]): Record<string, AttendanceRow[]> {
  const map: Record<string, AttendanceRow[]> = {};
  for (const row of data) {
    if (!map[row.organization_name]) map[row.organization_name] = [];
    map[row.organization_name].push(row);
  }
  return map;
}
