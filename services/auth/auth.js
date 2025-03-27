import { AuthenticationError, ValidationError } from "../../utils/errors.js";
import { post } from "../../utils/request.js";

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

export {
	loginWithEmailAndPassword,
	refreshWithToken,
	sendVerifyEmail,
	verifyEmailCode,
	verifyWithToken,
};
