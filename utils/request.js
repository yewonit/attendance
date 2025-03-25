const AUTH_SERVER_URL = `${environment.AUTH_SERVER_HOST}:${environment.AUTH_SERVER_PORT}`;

const get = async (path, headers) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "GET",
		headers: headers,
	})
		.then((response) => {
			if (!response.ok) {
				return {
					status: response.status,
					message: response.json(),
				};
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Request 에러 발생:", error);
		});

	return response;
};

const post = async (path, headers, body) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "POST",
		body: JSON.stringify(body),
		headers: headers,
	})
		.then((response) => {
			if (!response.ok) {
				return {
					status: response.status,
					message: response.json(),
				};
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Request 에러 발생:", error);
		});

	return response;
};

const put = async (path, headers, body) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "PUT",
		body: JSON.stringify(body),
		headers: headers,
	})
		.then((response) => {
			if (!response.ok) {
				return {
					status: response.status,
					message: response.json(),
				};
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Request 에러 발생:", error);
		});

	return response;
};

const patch = async (path, headers, body) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "PATCH",
		body: JSON.stringify(body),
		headers: headers,
	})
		.then((response) => {
			if (!response.ok) {
				return {
					status: response.status,
					message: response.json(),
				};
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Request 에러 발생:", error);
		});

	return response;
};

const del = async (path, headers) => {
	const url = `${AUTH_SERVER_URL}${path}`;
	const response = await fetch(url, {
		method: "DELETE",
		headers: headers,
	})
		.then((response) => {
			if (!response.ok) {
				return {
					status: response.status,
					message: response.json(),
				};
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Request 에러 발생:", error);
		});

	return response;
};

export { del, get, patch, post, put };
