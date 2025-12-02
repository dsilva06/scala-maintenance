import { httpClient } from './httpClient';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  if (params.sort) query.set('sort', params.sort);
  if (params.search) query.set('search', params.search);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.vehicleId) query.set('vehicle_id', params.vehicleId);
  if (params.limit) query.set('limit', params.limit);

  return query.toString();
}

export async function listMaintenanceOrders(params = {}) {
  const query = buildQuery(params);
  const response = await httpClient.get(`/api/maintenance-orders${query ? `?${query}` : ''}`);
  return response?.data ?? [];
}

export async function createMaintenanceOrder(payload) {
  const response = await httpClient.post('/api/maintenance-orders', payload);
  return response?.data ?? response;
}

export async function getMaintenanceOrder(id) {
  const response = await httpClient.get(`/api/maintenance-orders/${id}`);
  return response?.data ?? response;
}

export async function updateMaintenanceOrder(id, payload) {
  const response = await httpClient.patch(`/api/maintenance-orders/${id}`, payload);
  return response?.data ?? response;
}

export async function deleteMaintenanceOrder(id) {
  await httpClient.delete(`/api/maintenance-orders/${id}`);
}
