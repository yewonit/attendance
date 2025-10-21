import {
	ForeignKeyConstraintError,
	UniqueConstraintError,
	ValidationError,
} from "sequelize";
import { sequelize } from "../../utils/database.js";

const crudService = {
	/**
	 * 생성 트랜잭션 래퍼
	 * @description 단일 레코드 생성 시 트랜잭션을 적용합니다. 유효성 검증 함수가 제공되면 먼저 검증을 수행합니다.
	 * TODO: 다중 레코드 생성 시 배치 트랜잭션 옵션 및 고립 수준(isolation level) 확장
	 */
	create: (model, validateData) => async (newModel) => {
		try {
			if (validateData) {
				await validateData(newModel);
			}

			return await sequelize.transaction(async (t) => {
				return await model.create(newModel, { transaction: t });
			});
		} catch (error) {
			await handleError(error);
		}
	},

	/**
	 * 조회 트랜잭션 래퍼
	 * @description 조회 작업을 일반 트랜잭션으로 감쌉니다.
	 */
	findAll: (model) => async () => {
		try {
			return await sequelize.transaction(async (t) => {
				return await model.findAll({ transaction: t });
			});
		} catch (error) {
			await handleError(error);
		}
	},

	/**
	 * 단건 조회 트랜잭션 래퍼
	 */
	findOne: (model) => async (id) => {
		try {
			return await sequelize.transaction(async (t) => {
				const data = await model.findByPk(id, { transaction: t });

				if (data) {
					return data;
				} else {
					const error = new Error("리소스(DB데이터를)를 찾을 수 없음");
					error.status = 404;
					throw error;
				}
			});
		} catch (error) {
			await handleError(error);
		}
	},

	/**
	 * 업데이트 트랜잭션 래퍼
	 * @description 단일 레코드 업데이트 시 트랜잭션을 적용합니다. 유효성 검증 함수가 필수로 제공되어야 합니다.
	 * TODO: 부분 업데이트 시 변경 필드 목록 검증 로직 강화
	 */
	update: (model, validateData) => async (id, newModel) => {
		try {
			if (validateData) {
				await validateData(newModel);
			} else {
				const error = new Error("유효성 검사 함수가 제공되지 않았습니다.");
				error.status = 500;
				throw error;
			}

			return await sequelize.transaction(async (t) => {
				const [updated] = await model.update(newModel, {
					where: { id: id },
					transaction: t,
				});

				if (updated) {
					return updated;
				} else {
					const error = new Error("리소스(해당 ID의 데이터)를 찾을 수 없음");
					error.status = 404;
					throw error;
				}
			});
		} catch (error) {
			await handleError(error);
		}
	},

	/**
	 * 삭제 트랜잭션 래퍼
	 * @description 단일 레코드 삭제 시 트랜잭션을 적용합니다.
	 * TODO: 연쇄 삭제가 필요한 경우(외래키 참조) CASCADE 정책/수동 삭제 보완
	 */
	delete: (model) => async (id) => {
		try {
			return await sequelize.transaction(async (t) => {
				const deleted = await model.destroy({
					where: { id: id },
					transaction: t,
				});

				if (deleted) {
					return deleted;
				} else {
					const error = new Error("리소스(해당 ID의 데이터)를 찾을 수 없음");
					error.status = 404;
					throw error;
				}
			});
		} catch (error) {
			await handleError(error);
		}
	},
};

const handleError = async (err) => {
	let errorMessage = "서버 내부에서 처리할 수 없는 에러가 발생하였습니다.";
	let statusCode = err.status || 500;

	if (err instanceof ValidationError) {
		errorMessage = `입력된 데이터가 요구 사항을 만족하지 못합니다: ${err.errors
			.map((e) => `${e.path}: ${e.message}`)
			.join(", ")}`;
		statusCode = 400;
	} else if (err instanceof UniqueConstraintError) {
		errorMessage = `데이터의 유니크 조건을 위반하였습니다. 중복된 값이 존재합니다: ${err.errors
			.map((e) => `${e.path}: ${e.message}`)
			.join(", ")}`;
		statusCode = 409;
	} else if (err instanceof ForeignKeyConstraintError) {
		errorMessage = `외래 키 제약 조건이 충족되지 않습니다. 관련 데이터가 존재하지 않을 수 있습니다: ${err.detail}`;
		statusCode = 422;
	} else if (err.message) {
		errorMessage = err.message;
	}
	return {
		code: statusCode,
		message: errorMessage,
		error: err.name || "ServerError",
		timestamp: new Date().toISOString(),
	};
};

export default crudService;
