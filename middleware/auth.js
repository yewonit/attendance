import { AuthenticationError } from "../utils/errors";
import { verifyWithToken } from "../services/auth/auth";

export default async (req, res, next) => {
	try {
		const accessToken = req.headers.authorization?.split(" ")[1];

		if (!accessToken) {
			throw new AuthenticationError("token missing");
		}

		const response = await verifyWithToken(accessToken);
		const { email, name } = response.data;
		req.auth = { email, name };

		// 다음 미들웨어로 전달
		next();
	} catch (error) {
		next(error);
	}
};
