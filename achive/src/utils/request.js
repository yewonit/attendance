import environment from "../../config/environment.js";

const AUTH_SERVER_URL = `http://${environment.AUTH_SERVER_HOST}:${environment.AUTH_SERVER_PORT}`;

const get = async (path, headers) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	})
		.then(async (response) => {
			const body = await response.json();
			if (!response.ok) {
				return {
					status: response.status,
					message: body.error,
				};
			}
			return body;
		})
		.catch((error) => {
			return {
				status: 500,
				message: `Request 에러 발생: ${error}`,
			};
		});

	return response;
};

const post = async (path, headers, body) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "POST",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	})
		.then(async (response) => {
			const body = await response.json();
			if (!response.ok) {
				return {
					status: response.status,
					message: body.error,
				};
			}
			return body;
		})
		.catch((error) => {
			return {
				status: 500,
				message: `Request 에러 발생: ${error}`,
			};
		});

	return response;
};

const put = async (path, headers, body) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "PUT",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	})
		.then(async (response) => {
			const body = await response.json();
			if (!response.ok) {
				return {
					status: response.status,
					message: body.error,
				};
			}
			return body;
		})
		.catch((error) => {
			return {
				status: 500,
				message: `Request 에러 발생: ${error}`,
			};
		});

	return response;
};

const patch = async (path, headers, body) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "PATCH",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	})
		.then(async (response) => {
			const body = await response.json();
			if (!response.ok) {
				return {
					status: response.status,
					message: body.error,
				};
			}
			return body;
		})
		.catch((error) => {
			return {
				status: 500,
				message: `Request 에러 발생: ${error}`,
			};
		});

	return response;
};

const del = async (path, headers) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	})
		.then(async (response) => {
			const body = await response.json();
			if (!response.ok) {
				return {
					status: response.status,
					message: body.error,
				};
			}
			return body;
		})
		.catch((error) => {
			return {
				status: 500,
				message: `Request 에러 발생: ${error}`,
			};
		});

	return response;
};

export { del, get, patch, post, put };
