const DEFAULT_HEADERS = {
	'Content-Type': 'application/json'
};

const httpPost = (url, data = {}, headers = {}) => fetch(url, {
	method: 'POST',
	body: JSON.stringify(data),
	headers: {
		...DEFAULT_HEADERS,
		...headers
	}
});
const httpPut = (url, data = {}, headers = {}) => fetch(url, {
	method: 'PUT',
	body: JSON.stringify(data),
	headers: {
		...DEFAULT_HEADERS,
		...headers
	}
});
const httpPatch = (url, data = {}, headers = {}) => fetch(url, {
	method: 'PATCH',
	body: JSON.stringify(data),
	headers: {
		...DEFAULT_HEADERS,
		...headers
	}
});
const httpDelete = (url, headers = {}) => fetch(url, {
	method: 'DELETE',
	headers: {
		...DEFAULT_HEADERS,
		...headers
	}
});

const copyToClipboard = text => new Promise((resolve, reject) => {
	try {
		return resolve(navigator.clipboard.writeText(text));
	} catch (ex) {
		return reject(ex);
	}
});

const checkHttpStatus = res => {
	if ([200, 201, 204].includes(res.status)) {
		return res;
	}

	throw Error(`${res.status} ${res.statusText}`);
};

export {
	httpPost,
	httpPut,
	httpPatch,
	httpDelete,
	copyToClipboard,
	checkHttpStatus
};
