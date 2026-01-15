const API_VERSION = import.meta.env.VITE_API_VERSION?.trim();
const API_PREFIX = `/api${API_VERSION ? `/${API_VERSION}` : ''}`;

export const apiPath = (path = '') =>
  `${API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;
