import environment from "../../config/environment.js";
import { post } from "../../utils/request.js";

const AUTH_SERVER_URL = `${environment.AUTH_SERVER_HOST}:${environment.AUTH_SERVER_PORT}`;

const loginWithEmailAndPassword = async (email, name, password) => {
	const path = "/v1/token";
	const response = await post(
		path,
		{},
		{ email: email, name: name, password: password }
	);
	return response;
};

const verifyWithTokens = async (accessToken, refreshToken) => {
	const verifyPath = "/v1/verify";
	const verifyResponse = await post(
		verifyPath,
		{},
		{ accessToken: accessToken }
	);
	if (verifyResponse.status === 401) {
		const refreshPath = "/v1/refresh";
		const refreshResponse = await post(
			refreshPath,
			{},
			{ refreshToken: refreshToken }
		);
		return refreshResponse;
	}
	return verifyResponse;
};

const sendVerifyEmail = async (email) => {
	const path = "/v1/mail/code";
	const response = await post(path, {}, { email: email });
	return response;
};

const verifyEmailCode = async (email, code) => {
	const path = "/v1/mail/verify";
	const response = await post(path, {}, { email: email, code: code });
	return response;
};

export {
	loginWithEmailAndPassword,
	verifyWithTokens,
	sendVerifyEmail,
	verifyEmailCode,
};
