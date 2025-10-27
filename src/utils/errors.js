export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication failed', status = 401) {
    super(message, status);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', status = 400) {
    super(message, status);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', status = 403) {
    super(message, status);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', status = 404) {
    super(message, status);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', status = 429) {
    super(message, status);
  }
}
