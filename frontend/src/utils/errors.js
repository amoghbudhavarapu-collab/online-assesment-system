export function getErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  return data?.error?.message || data?.message || error?.message || fallback;
}

export function getFieldErrors(error) {
  return error?.response?.data?.error?.fields || {};
}
