export const ensureSuccessfulResponse = (response) => {
  const statusCode = response?.statusCode

  if (typeof statusCode !== 'number' || statusCode < 200 || statusCode >= 300) {
    const error = new Error(`API request failed with status ${statusCode ?? 'unknown'}`)
    error.statusCode = statusCode
    error.response = response
    throw error
  }

  return response
}