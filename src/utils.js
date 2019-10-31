const post = (url, data = {}) => fetch(url, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});
const put = (url, data = {}) => fetch(url, {
  method: 'PUT',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});
const patch = (url, data = {}) => fetch(url, {
  method: 'PATCH',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});

const copyToClipboard = text => new Promise((resolve, reject) => {
  try {
    return resolve(navigator.clipboard.writeText(text));
  } catch (ex) {
    return reject(ex);
  }
});

export {
  post,
  put,
  patch,
  copyToClipboard
};