export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Check the highlighted fields', fields: result.error.flatten().fieldErrors } });
  req[source] = result.data;
  next();
};
