import {
	ForeignKeyConstraintError,
	UniqueConstraintError,
	ValidationError,
} from "sequelize";

const crudService = {
	create: (model, validateData) => async (newModel) => {
		try {
			if (validateData) {
				await validateData(newModel);
			}

			return await model.create(newModel);
		} catch (error) {
			await handleError(error);
		}
	},

	findAll: (model) => async () => {
		try {
			return await model.findAll();
		} catch (error) {
			await handleError(error);
		}
	},

	findOne: (model) => async (id) => {
		try {
			const data = await model.findByPk(id);

			if (data) {
				return data;
			} else {
				const error = new Error("리소스(DB데이터를)를 찾을 수 없음");
				error.status = 404;
				throw error;
			}
		} catch (error) {
			await handleError(error);
		}
	},

	update: (model, validateData) => async (id, newModel) => {
		try {
			if (validateData) {
				await validateData(newModel);
			} else {
				const error = new Error("유효성 검사 함수가 제공되지 않았습니다.");
				error.status = 500;
				throw error;
			}

			const [updated] = await model.update(newModel, {
				where: { id: id },
			});

			if (updated) {
				return updated;
			} else {
				const error = new Error("리소스(해당 ID의 데이터)를 찾을 수 없음");
				error.status = 404;
				throw error;
			}
		} catch (error) {
			await handleError(error);
		}
	},

	delete: (model) => async (id) => {
		try {
			const deleted = await model.destroy({ where: { id: id } });

			if (deleted) {
				return deleted;
			} else {
				const error = new Error("리소스(해당 ID의 데이터)를 찾을 수 없음");
				error.status = 404;
				throw error;
			}
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
