import { Router } from "express";
import models from "../../models/models.js";
import {
	loginWithEmailAndPassword,
	refreshWithToken,
	resetPassword,
	sendVerifyEmail,
	verifyEmailCode,
	verifyWithToken,
} from "../../services/auth/auth.js";
import { AuthenticationError, ValidationError } from "../../utils/errors.js";
import userService from "../../services/user/user.js";

const router = Router();

router.post("/register", async (req, res, next) => {
	const { id, email, password } = req.body;
	if (!id || !email || !password)
		next(
			new ValidationError(
				`필수 값이 누락되었습니다. id: ${id}, email: ${email}, password: ${password}`
			)
		);

	try {
		const updated = await userService.setEmailAndPassword(id, email, password);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.post("/login", async (req, res, next) => {
	const { email, password } = req.body;
	try {
		const user = await models.User.findOne({
			where: {
				email: email,
			},
		});
		if (!user)
			throw new ValidationError("해당 이메일로 유저를 찾을 수 없습니다.");
		if (user.password !== Buffer.from(password).toString("base64"))
			throw new AuthenticationError("패스워드가 일치하지 않습니다.");

		const tokens = await loginWithEmailAndPassword(email, user.name);
		const userData = await userService.checkUserPhoneNumber(
			user.name,
			user.phone_number
		);
		delete user.password;

		res.status(200).json({
			tokens: tokens,
			userData: userData,
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

router.post("/reset-password", async (req, res, next) => {
	const { name, phoneNumber } = req.body;
	try {
		const result = await resetPassword(name, phoneNumber);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
});

export default router;
