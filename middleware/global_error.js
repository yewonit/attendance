export default (err, req, res, next) => {
	res.status(err.status || 500).json({
		error: {
			name: err.name,
			message: err.message || "서버 에러가 발생했습니다.",
		},
	});
};
