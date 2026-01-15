import { apiPath } from '@/api/apiPath';
import { httpClient } from '@/api/httpClient';

const sortMap = {
  created_date: 'created_at',
  updated_date: 'updated_at',
  start_date: 'start_date',
  estimated_arrival: 'estimated_arrival',
};

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
      return;
    }

    query.set(key, value);
  });

  return query.toString();
}

function normalizeSort(sort, map = {}) {
  if (!sort || typeof sort !== 'string') return sort;

  const direction = sort.startsWith('-') ? '-' : '';
  const key = sort.replace(/^-/, '');

  return `${direction}${map[key] ?? key}`;
}

export async function listTrips(params = {}) {
  const normalized = { ...params };

  if (normalized.sort) {
    normalized.sort = normalizeSort(normalized.sort, sortMap);
  }

  const query = buildQuery(normalized);
  const response = await httpClient.get(`${apiPath('trips')}${query ? `?${query}` : ''}`);
  return response?.data ?? [];
}

export async function getTrip(id) {
  const response = await httpClient.get(apiPath(`trips/${id}`));
  return response?.data ?? response;
}

export async function createTrip(payload) {
  const response = await httpClient.post(apiPath('trips'), payload);
  return response?.data ?? response;
}

export async function updateTrip(id, payload) {
  const response = await httpClient.patch(apiPath(`trips/${id}`), payload);
  return response?.data ?? response;
}

export async function deleteTrip(id) {
  await httpClient.delete(apiPath(`trips/${id}`));
}
