import { httpClient } from './httpClient';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  if (params.sort) query.set('sort', params.sort);
  if (params.search) query.set('search', params.search);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.limit) query.set('limit', params.limit);

  return query.toString();
}

export async function listVehicles(params = {}) {
  const query = buildQuery(params);
  const response = await httpClient.get(`/api/vehicles${query ? `?${query}` : ''}`);
  return response?.data ?? [];
}

export async function createVehicle(payload) {
  const response = await httpClient.post('/api/vehicles', payload);
  return response?.data ?? response;
}

export async function updateVehicle(id, payload) {
  const response = await httpClient.patch(`/api/vehicles/${id}`, payload);
  return response?.data ?? response;
}

export async function deleteVehicle(id) {
  await httpClient.delete(`/api/vehicles/${id}`);
}
