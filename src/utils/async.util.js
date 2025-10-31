/**
 * Async handler wrapper for Express route handlers
 * Catches async errors and passes them to the error middleware
 */
export const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
