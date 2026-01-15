import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiPath } from '@/api/apiPath';
import { httpClient } from '@/api/httpClient';
import { tripKeys } from './useTrips';

export function useTripTelemetry({
  enabled,
  tripId,
  listParams,
  positionHistoryLimit = 60,
}) {
  const queryClient = useQueryClient();
  const streamRef = useRef(null);
  const lastEventIdRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
      }
      return;
    }

    const params = new URLSearchParams();
    if (tripId) {
      params.set('trip_id', tripId);
    }
    if (lastEventIdRef.current) {
      params.set('last_id', lastEventIdRef.current);
    }

    const url = `${httpClient.baseUrl}${apiPath('telemetry/stream')}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    const source = new EventSource(url, { withCredentials: true });
    streamRef.current = source;

    const handlePosition = (event) => {
      if (!event?.data) {
        return;
      }

      const payload = JSON.parse(event.data);
      if (event.lastEventId) {
        lastEventIdRef.current = event.lastEventId;
      }

      const position = payload.position;
      const tripIdValue = Number(payload.trip_id);
      if (!position || !Number.isFinite(tripIdValue)) {
        return;
      }

      const updateTrip = (trip) => {
        if (!trip) {
          return trip;
        }

        const history = Array.isArray(trip.position_history)
          ? [...trip.position_history]
          : [];
        history.push(position);
        if (history.length > positionHistoryLimit) {
          history.splice(0, history.length - positionHistoryLimit);
        }

        return {
          ...trip,
          current_position: position,
          position_history: history,
        };
      };

      queryClient.setQueryData(tripKeys.list(listParams ?? {}), (old) => {
        if (!Array.isArray(old)) {
          return old;
        }

        return old.map((trip) => (trip.id === tripIdValue ? updateTrip(trip) : trip));
      });

      queryClient.setQueryData(tripKeys.detail(tripIdValue), (old) => updateTrip(old));
    };

    source.addEventListener('gps.position', handlePosition);
    source.addEventListener('heartbeat', () => {});
    source.onerror = () => {};

    return () => {
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
      }
    };
  }, [enabled, tripId, listParams, positionHistoryLimit, queryClient]);
}
