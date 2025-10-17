export default function validate(schema, property = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((d) => ({ message: d.message, path: d.path })),
      });
    }

    if (property === "query" || property === "params") {
      const target = req[property] || {};
      for (const key of Object.keys(target)) delete target[key];
      Object.assign(target, value);
    } else {
      req[property] = value;
    }
    next();
  };
}

