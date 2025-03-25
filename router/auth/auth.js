import { Router } from "express";
import models from "../../models/models.js";
import {
	loginWithEmailAndPassword,
	refreshWithToken,
	sendVerifyEmail,
	verifyEmailCode,
	verifyWithTokens,
} from "../../services/auth/auth.js";
import { AuthenticationError } from "../../utils/errors.js";

const router = Router();

router.post("/login", async (req, res, next) => {
	const { email, name, password } = req.body;
	try {
		const tokens = await loginWithEmailAndPassword(email, name, password);
		const userData = await models.User.findOne({
			where: {
				email: email,
				password: Buffer.from(password).toString("base64"),
			},
		});
		res.status(200).json({
			tokens: tokens,
			user: userData,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/login", async (req, res, next) => {
	const bearerAccessToken = req.header("Authorization");
	const { type, accessToken } = bearerAccessToken.split(" ");
	try {
		const data = await verifyWithTokens(accessToken);
		const userData = await models.User.findOne({
			email: data.email,
			name: data.name,
		});
		res.json({
			user: userData,
		});
	} catch (error) {
		next(error);
	}
});

router.post("/refresh", async (req, res, next) => {
	const refreshToken = req.body.refreshToken;
	try {
		const tokens = await refreshWithToken(refreshToken);
		res.json(tokens);
	} catch (error) {
		next(error);
	}
});

router.post("/code", async (req, res, next) => {
	const email = req.body.email;
	try {
		await sendVerifyEmail(email);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
});

router.post("/verify", async (req, res, next) => {
	const { email, code } = req.body;
	try {
		const isVerified = await verifyEmailCode(email, code);
		if (isVerified) res.status(200).json(isVerified);
		else throw new AuthenticationError("이메일 검증에 실패했습니다.");
	} catch (error) {
		next(error);
	}
});

export default router;
