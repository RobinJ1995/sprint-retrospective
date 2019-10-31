const httpPost = (url, data = {}) => fetch(url, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});
const httpPut = (url, data = {}) => fetch(url, {
  method: 'PUT',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});
const httpPatch = (url, data = {}) => fetch(url, {
  method: 'PATCH',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});
const httpDelete = (url) => fetch(url, {
  method: 'DELETE',
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
  httpPost,
  httpPut,
  httpPatch,
  httpDelete,
  copyToClipboard
};