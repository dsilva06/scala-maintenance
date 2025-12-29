import { httpClient } from './httpClient';

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

function createVehicleClient() {
  const sortMap = {
    created_date: 'created_at',
    updated_date: 'updated_at',
  };

  const list = async (sortOrParams, limit) => {
    const params =
      typeof sortOrParams === 'object' && sortOrParams !== null
        ? { ...sortOrParams }
        : {
            sort: sortOrParams,
            ...(limit ? { limit } : {}),
          };

    if (params.sort) {
      params.sort = normalizeSort(params.sort, sortMap);
    }

    const query = buildQuery(params);
    const response = await httpClient.get(`/api/vehicles${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(`/api/vehicles/${id}`);
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post('/api/vehicles', payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(`/api/vehicles/${id}`, payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(`/api/vehicles/${id}`);
    return null;
  };

  return {
    list,
    filter: (params = {}) => list(params),
    get,
    create,
    update,
    delete: destroy,
  };
}

function createInspectionClient() {
  const sortMap = {
    created_date: 'created_at',
    updated_date: 'updated_at',
    inspection_date: 'inspection_date',
  };

  const list = async (sortOrParams, limit) => {
    const params =
      typeof sortOrParams === 'object' && sortOrParams !== null
        ? { ...sortOrParams }
        : {
            sort: sortOrParams,
            ...(limit ? { limit } : {}),
          };

    if (params.sort) {
      params.sort = normalizeSort(params.sort, sortMap);
    }

    const query = buildQuery(params);
    const response = await httpClient.get(`/api/inspections${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(`/api/inspections/${id}`);
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post('/api/inspections', payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(`/api/inspections/${id}`, payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(`/api/inspections/${id}`);
    return null;
  };

  return {
    list,
    filter: (params = {}) => list(params),
    get,
    create,
    update,
    delete: destroy,
  };
}

function createSparePartClient() {
  const sortMap = {
    created_date: 'created_at',
    updated_date: 'updated_at',
    name: 'name',
  };

  const list = async (sortOrParams, limit) => {
    const params =
      typeof sortOrParams === 'object' && sortOrParams !== null
        ? { ...sortOrParams }
        : {
            sort: sortOrParams,
            ...(limit ? { limit } : {}),
          };

    if (params.sort) {
      params.sort = normalizeSort(params.sort, sortMap);
    }

    const query = buildQuery(params);
    const response = await httpClient.get(`/api/spare-parts${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(`/api/spare-parts/${id}`);
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post('/api/spare-parts', payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(`/api/spare-parts/${id}`, payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(`/api/spare-parts/${id}`);
    return null;
  };

  return {
    list,
    filter: (params = {}) => list(params),
    get,
    create,
    update,
    delete: destroy,
  };
}

function createPurchaseOrderClient() {
  const sortMap = {
    created_date: 'created_at',
    updated_date: 'updated_at',
    expected_date: 'expected_date',
    total_amount: 'total_amount',
  };

  const list = async (sortOrParams, limit) => {
    const params =
      typeof sortOrParams === 'object' && sortOrParams !== null
        ? { ...sortOrParams }
        : {
            sort: sortOrParams,
            ...(limit ? { limit } : {}),
          };

    if (params.sort) {
      params.sort = normalizeSort(params.sort, sortMap);
    }

    const query = buildQuery(params);
    const response = await httpClient.get(`/api/purchase-orders${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(`/api/purchase-orders/${id}`);
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post('/api/purchase-orders', payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(`/api/purchase-orders/${id}`, payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(`/api/purchase-orders/${id}`);
    return null;
  };

  return {
    list,
    filter: (params = {}) => list(params),
    get,
    create,
    update,
    delete: destroy,
  };
}

function createPlaceholderEntity(name) {
  const notImplemented = () => {
    throw new Error(`${name} API not implemented yet`);
  };

  const emptyList = async () => [];
  const noop = async () => notImplemented();

  return {
    list: emptyList,
    filter: emptyList,
    get: noop,
    create: noop,
    update: noop,
    delete: noop,
  };
}

export const apiClient = {
  entities: {
    Vehicle: createVehicleClient(),
    MaintenanceOrder: createPlaceholderEntity('MaintenanceOrder'),
    Inspection: createInspectionClient(),
    SparePart: createSparePartClient(),
    PurchaseOrder: createPurchaseOrderClient(),
    Document: createPlaceholderEntity('Document'),
    RepairGuide: createPlaceholderEntity('RepairGuide'),
    Trip: createPlaceholderEntity('Trip'),
    Alert: createPlaceholderEntity('Alert'),
    Driver: createPlaceholderEntity('Driver'),
  },
  auth: {},
};
