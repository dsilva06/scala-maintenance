import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrip,
  deleteTrip,
  getTrip,
  listTrips,
  updateTrip,
} from '../api/tripsApi';

export const tripKeys = {
  all: ['trips'],
  lists: () => ['trips', 'list'],
  list: (params) => ['trips', 'list', params],
  detail: (id) => ['trips', 'detail', id],
};

export function useTrips(params = {}, options = {}) {
  return useQuery({
    queryKey: tripKeys.list(params),
    queryFn: () => listTrips(params),
    ...options,
  });
}

export function useTrip(id, options = {}) {
  const { enabled = true, ...rest } = options;

  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => getTrip(id),
    enabled: Boolean(id) && enabled,
    ...rest,
  });
}

export function useCreateTrip(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useMutation({
    mutationFn: createTrip,
    ...rest,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      onSuccess?.(data, variables, context);
    },
  });
}

export function useUpdateTrip(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useMutation({
    mutationFn: ({ id, payload }) => updateTrip(id, payload),
    ...rest,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      onSuccess?.(data, variables, context);
    },
  });
}

export function useDeleteTrip(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useMutation({
    mutationFn: deleteTrip,
    ...rest,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      onSuccess?.(data, variables, context);
    },
  });
}
