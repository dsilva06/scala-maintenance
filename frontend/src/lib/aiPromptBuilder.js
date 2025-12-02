const SECTION_CONFIG = {
  vehicles: {
    label: 'Vehículos',
    keywords: ['vehicle', 'vehículo', 'vehiculos', 'vehículos', 'fleet', 'camion', 'camión', 'unidad'],
    fields: [
      'id',
      'name',
      'plate',
      'plate_number',
      'unit_number',
      'model',
      'year',
      'status',
      'assigned_driver',
      'last_service_date',
      'next_service_date'
    ],
    promptLimit: 5,
    previewLimit: 15
  },
  maintenanceOrders: {
    label: 'Órdenes de mantenimiento',
    keywords: ['maintenance', 'mantenimiento', 'orden', 'repair', 'taller', 'service order'],
    fields: [
      'id',
      'code',
      'status',
      'vehicle',
      'vehicle_id',
      'priority',
      'scheduled_date',
      'completion_date',
      'summary',
      'cost'
    ],
    promptLimit: 5,
    previewLimit: 15
  },
  trips: {
    label: 'Viajes',
    keywords: ['viaje', 'trip', 'ruta', 'route', 'delivery', 'traslado'],
    fields: [
      'id',
      'vehicle_id',
      'driver_id',
      'origin',
      'destination',
      'start_date',
      'end_date',
      'status',
      'notes'
    ],
    promptLimit: 5,
    previewLimit: 15
  },
  spareParts: {
    label: 'Repuestos',
    keywords: ['repuesto', 'spare', 'part', 'inventory', 'stock', 'pieza'],
    fields: ['id', 'name', 'sku', 'quantity', 'location', 'status', 'threshold'],
    promptLimit: 5,
    previewLimit: 20
  },
  inspections: {
    label: 'Inspecciones',
    keywords: ['inspection', 'inspección', 'checklist', 'auditoria', 'auditoría'],
    fields: [
      'id',
      'vehicle_id',
      'inspector',
      'inspection_date',
      'status',
      'result',
      'notes'
    ],
    promptLimit: 5,
    previewLimit: 15
  },
  documents: {
    label: 'Documentos',
    keywords: ['document', 'licencia', 'permiso', 'certificado', 'documento', 'expiration'],
    fields: [
      'id',
      'type',
      'status',
      'expires_on',
      'expiration_date',
      'vehicle_id',
      'driver_id',
      'renewal_date'
    ],
    promptLimit: 5,
    previewLimit: 15
  }
};

const FALLBACK_FIELD_LIMIT = 4;

function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  );
}

function sanitizeRecord(record, allowedFields) {
  if (!record || typeof record !== 'object') {
    return {};
  }

  const sanitized = {};

  for (const field of allowedFields) {
    const value = record[field];
    if (isPrimitive(value)) {
      sanitized[field] = value;
    }
  }

  if (Object.keys(sanitized).length > 0) {
    return sanitized;
  }

  let fallbackCount = 0;
  for (const [key, value] of Object.entries(record)) {
    if (fallbackCount >= FALLBACK_FIELD_LIMIT) {
      break;
    }
    if (isPrimitive(value)) {
      sanitized[key] = value;
      fallbackCount += 1;
    }
  }

  return sanitized;
}

function sanitizeDataset(records, config) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .slice(0, config.previewLimit)
    .map((record) => sanitizeRecord(record, config.fields))
    .filter((record) => Object.keys(record).length > 0);
}

function getRelevantSections(question) {
  if (!question) {
    return [];
  }

  const normalizedQuestion = question.toLowerCase();

  return Object.entries(SECTION_CONFIG)
    .filter(([, config]) =>
      config.keywords.some((keyword) => normalizedQuestion.includes(keyword))
    )
    .map(([sectionKey]) => sectionKey);
}

function buildAggregateSummary(companyData) {
  const lines = Object.entries(SECTION_CONFIG).map(([sectionKey, config]) => {
    const countKey = `${sectionKey}Total`;
    const total = typeof companyData?.[countKey] === 'number'
      ? companyData[countKey]
      : Array.isArray(companyData?.[sectionKey])
        ? companyData[sectionKey].length
        : 0;

    return `- ${config.label}: ${total} registros disponibles.`;
  });

  return `Resumen general de la información disponible:\n${lines.join('\n')}`;
}

function formatRecordsForPrompt(sectionKey, companyData) {
  const config = SECTION_CONFIG[sectionKey];
  if (!config) {
    return null;
  }

  const records = Array.isArray(companyData?.[sectionKey])
    ? companyData[sectionKey]
    : [];

  if (records.length === 0) {
    return null;
  }

  const limit = Math.min(config.promptLimit, records.length);
  const selected = records.slice(0, limit);
  const total = typeof companyData?.[`${sectionKey}Total`] === 'number'
    ? companyData[`${sectionKey}Total`]
    : records.length;

  const formattedRecords = selected
    .map((record) => JSON.stringify(record, null, 2))
    .map((recordString) => recordString.replace(/\n/g, '\n  '));

  return `${config.label} relevantes (mostrando ${limit} de ${total}):\n  ${formattedRecords.join('\n  ')}`;
}

export function createCompanyDataSnapshot(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return null;
  }

  const snapshot = {};

  for (const [sectionKey, config] of Object.entries(SECTION_CONFIG)) {
    const records = rawData[sectionKey];
    snapshot[sectionKey] = sanitizeDataset(records, config);
    snapshot[`${sectionKey}Total`] = Array.isArray(records) ? records.length : 0;
  }

  return snapshot;
}

export function buildAssistantPrompt(question, companyData) {
  const baseInstructions = `Eres FLOTA AI, un consultor experto en gestión de flotas vehiculares.\n` +
    `Tu conocimiento se basa exclusivamente en los datos de la empresa que se proporcionan.\n` +
    `Sé profesional, preciso y basa tus respuestas únicamente en la información disponible.\n` +
    `Si no tienes información suficiente, indícalo claramente.`;

  if (!companyData) {
    return `${baseInstructions}\n\nNo hay datos de la empresa disponibles en este momento.\n\nPregunta del usuario: "${question}"`;
  }

  const relevantSections = getRelevantSections(question);

  const sectionsToInclude = relevantSections.length > 0
    ? relevantSections
    : [];

  const sectionSummaries = sectionsToInclude
    .map((sectionKey) => formatRecordsForPrompt(sectionKey, companyData))
    .filter(Boolean);

  let contextBlock = '';
  if (sectionSummaries.length > 0) {
    contextBlock = sectionSummaries.join('\n\n');
  } else {
    contextBlock = buildAggregateSummary(companyData);
  }

  return `${baseInstructions}\n\nDATOS DE LA EMPRESA:\n${contextBlock}\n\nPregunta del usuario: "${question}"`;
}
