export const validate = (schema) => (req, res, next) => {
  try {
    // console.log(req.body);
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors,
    });
  }
};
