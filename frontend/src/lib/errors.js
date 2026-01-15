export function getErrorMessage(error, fallback = 'Ocurrio un error') {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  const apiMessage = error?.data?.error?.message;
  if (apiMessage) {
    return apiMessage;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
}
