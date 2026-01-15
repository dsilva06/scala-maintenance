import { apiPath } from '@/api/apiPath';
import { httpClient } from '@/api/httpClient';

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
  const response = await httpClient.get(`${apiPath('vehicles')}${query ? `?${query}` : ''}`);
  return response?.data ?? [];
}

export async function createVehicle(payload) {
  const response = await httpClient.post(apiPath('vehicles'), payload);
  return response?.data ?? response;
}

export async function updateVehicle(id, payload) {
  const response = await httpClient.patch(apiPath(`vehicles/${id}`), payload);
  return response?.data ?? response;
}

export async function deleteVehicle(id) {
  await httpClient.delete(apiPath(`vehicles/${id}`));
}
