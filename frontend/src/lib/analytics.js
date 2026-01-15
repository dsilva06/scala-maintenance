import { sendAnalyticsEvents } from '@/api/analytics';

const enabledFlag = String(import.meta.env.VITE_ANALYTICS_ENABLED ?? 'true').toLowerCase();
const analyticsEnabled = enabledFlag !== 'false' && enabledFlag !== '0' && enabledFlag !== 'off';

export async function trackEvent(name, payload = {}, options = {}) {
  if (!analyticsEnabled || !name) {
    return null;
  }

  const event = {
    name,
    category: options.category ?? 'usage',
    entity_type: options.entityType,
    entity_id: options.entityId,
    occurred_at: options.occurredAt,
    payload,
    metadata: options.metadata,
    source: options.source ?? 'web',
  };

  try {
    return await sendAnalyticsEvents([event]);
  } catch (error) {
    return null;
  }
}
