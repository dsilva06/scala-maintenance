export function getErrorMessage(error, fallback = 'Ocurrio un error') {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  const apiMessage = error?.data?.message ?? error?.data?.error?.message ?? error?.response?.data?.message;
  if (apiMessage) {
    return apiMessage;
  }

  const validationErrors = error?.data?.errors ?? error?.response?.data?.errors;
  if (validationErrors && typeof validationErrors === 'object') {
    const firstKey = Object.keys(validationErrors)[0];
    const firstError = Array.isArray(validationErrors[firstKey])
      ? validationErrors[firstKey][0]
      : validationErrors[firstKey];
    if (firstError) {
      return firstError;
    }
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export function getErrorDetails(error) {
  if (!error) {
    return null;
  }

  const message = getErrorMessage(error, '');
  return message ? message : null;
}
