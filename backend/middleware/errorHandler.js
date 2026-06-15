// ── Central error handler ─────────────────────────────────────────────────────
// All errors thrown with next(err) land here.

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal Server Error";

  // Mongoose: bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message    = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose: validation errors
  if (err.name === "ValidationError") {
    statusCode = 422;
    message    = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError")  { statusCode = 401; message = "Invalid token."; }
  if (err.name === "TokenExpiredError")  { statusCode = 401; message = "Token expired. Please log in again."; }

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${req.method} ${req.path}]`, err.stack || err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

// ── 404 handler — attach before errorHandler in server.js ────────────────────
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
