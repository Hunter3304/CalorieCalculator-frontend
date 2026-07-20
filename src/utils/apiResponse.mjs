export const ensureSuccessfulResponse = (response) => {
  const statusCode = response && response.statusCode

  if (typeof statusCode !== 'number' || statusCode < 200 || statusCode >= 300) {
    const statusLabel = typeof statusCode === 'number' ? statusCode : 'unknown'
    const error = new Error(`API request failed with status ${statusLabel}`)
    error.statusCode = statusCode
    error.response = response
    throw error
  }

  return response
}