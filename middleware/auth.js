import { AuthenticationError } from "../src/utils/errors.js";
import { verifyWithToken } from "../src/services/auth/auth.js";

export default async (req, res, next) => {
	try {
		const accessToken = req.headers.authorization?.split(" ")[1];

		if (!accessToken) {
			throw new AuthenticationError("token missing");
		}

		const { email, name } = await verifyWithToken(accessToken);
		req.auth = { email, name };

		// 다음 미들웨어로 전달
		next();
	} catch (error) {
		next(error);
	}
};
