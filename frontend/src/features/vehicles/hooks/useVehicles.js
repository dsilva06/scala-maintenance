import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  updateVehicle,
} from '../api/vehiclesApi';

export const vehicleKeys = {
  all: ['vehicles'],
  lists: () => ['vehicles', 'list'],
  list: (params) => ['vehicles', 'list', params],
  detail: (id) => ['vehicles', 'detail', id],
};

export function useVehicles(params = {}, options = {}) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => listVehicles(params),
    ...options,
  });
}

export function useCreateVehicle(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useMutation({
    mutationFn: createVehicle,
    ...rest,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      onSuccess?.(data, variables, context);
    },
  });
}

export function useUpdateVehicle(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useMutation({
    mutationFn: ({ id, payload }) => updateVehicle(id, payload),
    ...rest,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      onSuccess?.(data, variables, context);
    },
  });
}

export function useDeleteVehicle(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useMutation({
    mutationFn: deleteVehicle,
    ...rest,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      onSuccess?.(data, variables, context);
    },
  });
}
