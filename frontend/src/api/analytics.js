import { apiPath } from './apiPath';
import { httpClient } from './httpClient';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    query.set(key, value);
  });

  return query.toString();
}

export async function sendAnalyticsEvents(events = []) {
  if (!Array.isArray(events) || events.length === 0) {
    return null;
  }

  const response = await httpClient.post(apiPath('analytics/events'), { events });
  return response?.data ?? response;
}

export async function fetchAnalyticsMetrics(params = {}) {
  const query = buildQuery(params);
  const response = await httpClient.get(`${apiPath('analytics/metrics')}${query ? `?${query}` : ''}`);
  return response?.data ?? response;
}
