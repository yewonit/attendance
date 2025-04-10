import { AuthenticationError, ValidationError } from "../../utils/errors.js";
import { post } from "../../utils/request.js";
import userService from "../user/user.js";

const loginWithEmailAndPassword = async (email, name) => {
	const path = "/v1/token";
	const response = await post(path, {}, { email, name });
	if (!response.status) return response;
	else if (response.status === 400) throw new ValidationError(response.message);
	else if (response.status === 401)
		throw new AuthenticationError(response.message);
	else throw new Error(response.message);
};

const verifyWithToken = async (accessToken) => {
	const path = "/v1/verify";
	const response = await post(path, {}, { accessToken });
	if (!response.status) return response;
	else if (response.status === 400) throw new ValidationError(response.message);
	else if (response.status === 401)
		throw new AuthenticationError(response.message);
	else throw new Error(response.message);
};

const refreshWithToken = async (refreshToken) => {
	const path = "/v1/refresh";
	const response = await post(path, {}, { refreshToken });
	if (!response.status) return response;
	else if (response.status === 400) throw new ValidationError(response.message);
	else if (response.status === 401)
		throw new AuthenticationError(response.message);
	else throw new Error(response.message);
};

const sendVerifyEmail = async (email) => {
	const path = "/v1/mail/code";
	const response = await post(path, {}, { email });
	if (!response.status) return response;
	else if (response.status === 400) throw new ValidationError(response.message);
	else if (response.status === 401)
		throw new AuthenticationError(response.message);
	else throw new Error(response.message);
};

const verifyEmailCode = async (email, code) => {
	const path = "/v1/mail/verify";
	const response = await post(path, {}, { email, code });
	if (!response.status) return response;
	else if (response.status === 400) throw new ValidationError(response.message);
	else if (response.status === 401)
		throw new AuthenticationError(response.message);
	else throw new Error(response.message);
};

const resetPassword = async (name, phoneNumber) => {
	const userData = await userService.checkUserPhoneNumber(name, phoneNumber);
	if (!userData.email)
		throw new ValidationError("email이 등록되지 않았습니다.");

	const generatedPassword = generateRandomPassword();

	await userService.updateUser(userData.id, {
		password: generatedPassword,
	});

	const path = "/v1/mail/reset-password";
	const response = await post(
		path,
		{},
		{ email: userData.email, newPassword: generatedPassword }
	);
	if (!response.status) return { email: userData.email };
	else if (response.status === 400) throw new ValidationError(response.message);
	else if (response.status === 401)
		throw new AuthenticationError(response.message);
	else throw new Error(response.message);
};

// private method
const generateRandomPassword = (length = 10) => {
	const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const specialCharacters = "!@#$%^&*(),.?:{}|<>";
	const allCharacters = lowerCaseLetters + numbers;

	let result = [
		lowerCaseLetters[Math.floor(Math.random() * lowerCaseLetters.length)],
		numbers[Math.floor(Math.random() * numbers.length)],
	];

	for (let i = 0; i < 2; i++) {
		result.push(
			specialCharacters[Math.floor(Math.random() * specialCharacters.length)]
		);
	}

	for (let i = result.length; i < length; i++) {
		result.push(
			allCharacters[Math.floor(Math.random() * allCharacters.length)]
		);
	}

	result = result.sort(() => Math.random() - 0.5);

	return result.join("");
};

export {
	loginWithEmailAndPassword,
	refreshWithToken,
	sendVerifyEmail,
	verifyEmailCode,
	verifyWithToken,
	resetPassword,
};
