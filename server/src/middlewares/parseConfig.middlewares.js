export const parseConfig = (req, res, next) => {
  if (req.body.config) {
    try {
      req.body.config = JSON.parse(req.body.config);
    } catch {
      return next(new ApiError(400, "Invalid config JSON"));
    }
  }
  next();
};
