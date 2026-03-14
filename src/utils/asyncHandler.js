/**
 * Utility function to wrap async route handlers
 * This ensures that any errors thrown in async functions are properly caught
 * and passed to the Express error handler middleware
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function that catches errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
