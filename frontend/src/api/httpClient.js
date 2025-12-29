const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function csrf() {
  await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

function getCookie(name) {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return value ? value.split('=')[1] : null;
}

async function request(path, { method = 'GET', body, headers = {}, skipCsrf = false, ...options } = {}) {
  if (!skipCsrf && method !== 'GET' && method !== 'HEAD') {
    await csrf();
  }

  const xsrfToken = getCookie('XSRF-TOKEN');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
      ...headers,
    },
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error('Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const httpClient = {
  csrf,
  request,
  get: (path, options) => request(path, { ...options, method: 'GET', skipCsrf: true }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  baseUrl: API_BASE_URL,
};
