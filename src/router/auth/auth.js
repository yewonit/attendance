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
import userService from "../../services/user/user.js";
import { AuthenticationError, ValidationError } from "../../utils/errors.js";
import { comparePassword } from "../../utils/password.js";
import permissionService from "../../services/permission/permission.js";

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
		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid)
			throw new AuthenticationError("패스워드가 일치하지 않습니다.");

		const tokens = await loginWithEmailAndPassword(email, user.name);

		const userRoleAndOrganization = await userService.getUserRoleOfCurrentSeason(user.id);
		const userPermissions = await permissionService.getUserPermissionCodes(user.id);

		const userData = {
			id: user.id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phone_number,
			roles: userRoleAndOrganization,
			permissions: userPermissions,
		};

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
		const user = await models.User.findOne({
			where: {
				email: data.email,
				name: data.name,
			},
		});

		const userRoleAndOrganization = await userService.getUserRoleOfCurrentSeason(user.id);
		const userPermissions = await permissionService.getUserPermissionCodes(user.id);

		const userData = {
			id: user.id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phone_number,
			roles: userRoleAndOrganization,
			permissions: userPermissions,
		};

		res.json({
			userData,
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
		if (isVerified) res.status(200).json({ "isVerified": isVerified });
		else throw new ValidationError("이메일 검증에 실패했습니다.");
	} catch (error) {
		next(error);
	}
});

router.post("/reset-password", async (req, res, next) => {
	const { id, password } = req.body;
	try {
		const result = await resetPassword(id, password);
		res.status(200).json({ "result": result });
	} catch (error) {
		next(error);
	}
});

router.get("/users/email", async (req, res, next) => {
	const email = req.query.email;
	try {
		await userService.emailDuplicationCheck(email);
		res.status(200).json({ message: "이메일 사용 가능", email });
	} catch (error) {
		next(error);
	}
});

router.get("/users/name", async (req, res, next) => {
	const name = req.query.name;

	try {
		const isExists = await userService.findUserByName(name);
		if (isExists) {
			res.status(200).json({ message: "이름이 있습니다." });
		} else {
			res.status(404).json({ message: "이름이 없습니다." });
		}
	} catch (error) {
		next(error);
	}
});

router.post("/users/phone-number", async (req, res, next) => {
	const { name, phoneNumber } = req.body;

	try {
		const userData = await userService.checkUserPhoneNumber(name, phoneNumber);
		res.status(200).json({
			isMatched: true,
			userData: userData,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
