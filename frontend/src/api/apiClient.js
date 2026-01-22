import { apiPath } from './apiPath';
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
    const response = await httpClient.get(`${apiPath('vehicles')}${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(apiPath(`vehicles/${id}`));
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post(apiPath('vehicles'), payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(apiPath(`vehicles/${id}`), payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(apiPath(`vehicles/${id}`));
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
    const response = await httpClient.get(`${apiPath('inspections')}${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(apiPath(`inspections/${id}`));
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post(apiPath('inspections'), payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(apiPath(`inspections/${id}`), payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(apiPath(`inspections/${id}`));
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
    const response = await httpClient.get(`${apiPath('spare-parts')}${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(apiPath(`spare-parts/${id}`));
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post(apiPath('spare-parts'), payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(apiPath(`spare-parts/${id}`), payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(apiPath(`spare-parts/${id}`));
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

function createDocumentClient() {
  const sortMap = {
    created_date: 'created_at',
    updated_date: 'updated_at',
    expiration_date: 'expiration_date',
    document_type: 'document_type',
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
    const response = await httpClient.get(`${apiPath('documents')}${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(apiPath(`documents/${id}`));
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post(apiPath('documents'), payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(apiPath(`documents/${id}`), payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(apiPath(`documents/${id}`));
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
    const response = await httpClient.get(`${apiPath('purchase-orders')}${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(apiPath(`purchase-orders/${id}`));
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post(apiPath('purchase-orders'), payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(apiPath(`purchase-orders/${id}`), payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(apiPath(`purchase-orders/${id}`));
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

function createTripClient() {
  const sortMap = {
    created_date: 'created_at',
    updated_date: 'updated_at',
    start_date: 'start_date',
    estimated_arrival: 'estimated_arrival',
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
    const response = await httpClient.get(`${apiPath('trips')}${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(apiPath(`trips/${id}`));
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post(apiPath('trips'), payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(apiPath(`trips/${id}`), payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(apiPath(`trips/${id}`));
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

function createRepairGuideClient() {
  const sortMap = {
    created_date: 'created_at',
    updated_date: 'updated_at',
    name: 'name',
    priority: 'priority',
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
    const response = await httpClient.get(`${apiPath('repair-guides')}${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(apiPath(`repair-guides/${id}`));
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post(apiPath('repair-guides'), payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(apiPath(`repair-guides/${id}`), payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(apiPath(`repair-guides/${id}`));
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

function createSupplierClient() {
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
    const response = await httpClient.get(`${apiPath('suppliers')}${query ? `?${query}` : ''}`);
    return response?.data ?? [];
  };

  const get = async (id) => {
    const response = await httpClient.get(apiPath(`suppliers/${id}`));
    return response?.data ?? response;
  };

  const create = async (payload) => {
    const response = await httpClient.post(apiPath('suppliers'), payload);
    return response?.data ?? response;
  };

  const update = async (id, payload) => {
    const response = await httpClient.patch(apiPath(`suppliers/${id}`), payload);
    return response?.data ?? response;
  };

  const destroy = async (id) => {
    await httpClient.delete(apiPath(`suppliers/${id}`));
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
    Supplier: createSupplierClient(),
    Document: createDocumentClient(),
    RepairGuide: createRepairGuideClient(),
    Trip: createTripClient(),
    Alert: createPlaceholderEntity('Alert'),
    Driver: createPlaceholderEntity('Driver'),
  },
  auth: {},
};
