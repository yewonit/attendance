import { Router } from "express";
import models from "../../models/models.js";
import {
	loginWithEmailAndPassword,
	refreshWithToken,
	sendVerifyEmail,
	verifyEmailCode,
	verifyWithToken,
} from "../../services/auth/auth.js";
import { AuthenticationError, ValidationError } from "../../utils/errors.js";

const router = Router();

router.post("/login", async (req, res, next) => {
	const { email, password } = req.body;
	try {
		const userData = await models.User.findOne({
			where: {
				email: email,
			},
		});
		if (!userData)
			throw new ValidationError("해당 이메일로 유저를 찾을 수 없습니다.");
		if (userData.password !== Buffer.from(password).toString("base64"))
			throw new AuthenticationError("패스워드가 일치하지 않습니다.");

		const tokens = await loginWithEmailAndPassword(email, userData.name);

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
	const accessToken = bearerAccessToken.split(" ")[1];
	try {
		const data = await verifyWithToken(accessToken);
		const userData = await models.User.findOne({
			where: {
				email: data.email,
				name: data.name,
			},
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
