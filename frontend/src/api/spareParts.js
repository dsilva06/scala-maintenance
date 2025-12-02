import { httpClient } from './httpClient';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  if (params.sort) query.set('sort', params.sort);
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.limit) query.set('limit', params.limit);

  return query.toString();
}

export async function listSpareParts(params = {}) {
  const query = buildQuery(params);
  const response = await httpClient.get(`/api/spare-parts${query ? `?${query}` : ''}`);
  return response?.data ?? [];
}

export async function createSparePart(payload) {
  const response = await httpClient.post('/api/spare-parts', payload);
  return response?.data ?? response;
}

export async function updateSparePart(id, payload) {
  const response = await httpClient.patch(`/api/spare-parts/${id}`, payload);
  return response?.data ?? response;
}

export async function deleteSparePart(id) {
  await httpClient.delete(`/api/spare-parts/${id}`);
}
