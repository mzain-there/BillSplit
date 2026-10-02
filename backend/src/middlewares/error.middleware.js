const errorHandler = (err, req, res, next) => {
  const statusCode = err?.statusCode || 500
  const message = err?.message || "Internal Server Error"

  // Only log unexpected internal server errors (500+) in terminal
  // Expected client errors like 401 (token expired/missing during refresh) are normal operational responses
  if (statusCode >= 500) {
    console.error("Server Error:", err)
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err?.errors || err?.error || [],
    stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined
  })
}

export default errorHandler