import {
	ForeignKeyConstraintError,
	UniqueConstraintError,
	ValidationError,
} from "sequelize";

const crudController = {
	create: (model, validateData) => async (req, res, next) => {
		try {
			if (validateData) {
				await validateData(req.body);
			}

			const data = await model.create(req.body);

			res.status(201).json({ data, message: "생성 완료" });
		} catch (error) {
			await handleError(error, req, res, next);
		}
	},

	readAll: (model) => async (req, res, next) => {
		try {
			const data = await model.findAll();

			res.status(200).json({ data, message: "조회 완료" });
		} catch (error) {
			await handleError(error, req, res, next);
		}
	},

	// 🔍 특정 데이터 조회 함수
	readOne: (model) => async (req, res, next) => {
		try {
			const data = await model.findByPk(req.params.id);

			if (data) {
				res.status(200).json({ data, message: "조회 완료" });
			} else {
				const error = new Error("리소스(DB데이터를)를 찾을 수 없음");
				error.status = 404;
				throw error;
			}
		} catch (error) {
			await handleError(error, req, res, next);
		}
	},

	update: (model, validateData) => async (req, res, next) => {
		try {
			if (validateData) {
				await validateData(req.body);
			} else {
				const error = new Error("유효성 검사 함수가 제공되지 않았습니다.");
				error.status = 500;
				throw error;
			}

			const [updated] = await model.update(req.body, {
				where: { id: req.body.id },
			});

			if (updated) {
				res.status(200).json({ message: "업데이트 완료" });
			} else {
				const error = new Error("리소스(해당 ID의 데이터)를 찾을 수 없음");
				error.status = 404;
				throw error;
			}
		} catch (error) {
			await handleError(error, req, res, next);
		}
	},

	delete: (model) => async (req, res, next) => {
		try {
			const deleted = await model.destroy({ where: { id: req.body.id } });

			if (deleted) {
				res.status(200).json({ message: "삭제 완료" });
			} else {
				const error = new Error("리소스(해당 ID의 데이터)를 찾을 수 없음");
				error.status = 404;
				throw error;
			}
		} catch (error) {
			await handleError(error, req, res, next);
		}
	},
};

const handleError = async (err, req, res, next) => {
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
	res.status(statusCode).json({
		code: statusCode,
		message: errorMessage,
		error: err.name || "ServerError",
		timestamp: new Date().toISOString(),
	});
};

export default crudController;
