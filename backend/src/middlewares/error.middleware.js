const errorHandler = (err, req, res, next) => {
  const statusCode = err?.statusCode || 500
  const message = err?.message || "Internal Server Error"

  // Log error to console for debugging
  console.error("Error occurred in middleware:", err)

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err?.errors || err?.error || [],
    stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined
  })
}

export default errorHandler