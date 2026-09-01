export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found." });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error("[Unhandled Error]", err);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    error: "Something went wrong on our end. Please try again.",
    ...(isProd ? {} : { detail: err.message }),
  });
}
