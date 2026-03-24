import ExcelJS from "exceljs";

/**
 * 출석 현황 데이터를 엑셀 파일(버퍼)로 변환합니다.
 * - "전체" 시트에 모든 데이터를 포함
 * - 각 조직별로 별도의 시트를 생성
 *
 * @param {Array<Object>} attendanceData - 출석 현황 배열
 *   - organization_name: 조직명
 *   - user_name: 사용자명
 *   - 그 외 출석 관련 컬럼들
 * @returns {Promise<Buffer>} 엑셀 파일 버퍼
 */
const attendanceToExcel = async (attendanceData) => {
	// 엑셀 워크북 생성
	const workbook = new ExcelJS.Workbook();

	// 조직별로 데이터 그룹핑
	const groupedByOrg = attendanceData.reduce((acc, row) => {
		const orgName = row.organization_name;
		if (!acc[orgName]) {
			acc[orgName] = [];
		}
		acc[orgName].push(row);
		return acc;
	}, {});

	// 전체 데이터를 하나의 시트로도 추가
	const allDataSheet = workbook.addWorksheet("전체");
	if (attendanceData.length > 0) {
		const columns = Object.keys(attendanceData[0]).map((key) => ({
			header:
				key === "organization_name"
					? "조직"
					: key === "user_name"
						? "이름"
						: key,
			key: key,
			width: 20,
		}));

		allDataSheet.columns = columns;

		attendanceData.forEach((row) => {
			allDataSheet.addRow(row);
		});

		// 헤더 스타일링
		allDataSheet.getRow(1).font = { bold: true };
		allDataSheet.getRow(1).alignment = {
			vertical: "middle",
			horizontal: "center",
		};
	}

	// 각 조직별로 시트 생성
	Object.keys(groupedByOrg).forEach((orgName) => {
		const worksheet = workbook.addWorksheet(orgName);
		const orgData = groupedByOrg[orgName];

		// 컬럼 정의 (첫 번째 데이터 행에서 추출)
		if (orgData.length > 0) {
			const columns = Object.keys(orgData[0]).map((key) => ({
				header:
					key === "organization_name"
						? "조직"
						: key === "user_name"
							? "이름"
							: key,
				key: key,
				width: 20,
			}));

			worksheet.columns = columns;

			// 데이터 추가
			orgData.forEach((row) => {
				worksheet.addRow(row);
			});

			// 헤더 스타일링
			worksheet.getRow(1).font = { bold: true };
			worksheet.getRow(1).alignment = {
				vertical: "middle",
				horizontal: "center",
			};
		}
	});

	// 버퍼로 변환
	const buffer = await workbook.xlsx.writeBuffer();
	return buffer;
};

export { attendanceToExcel };

