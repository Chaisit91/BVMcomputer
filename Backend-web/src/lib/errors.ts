// Thrown by the Zod checks in src/schemas/* — errorMiddleware maps this to a
// 400 with the readable message, instead of letting a raw Postgres CHECK
// violation (or an unhandled Zod error) surface as an opaque 500.
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// The compatibility engine runs as a separate local service. Keep its
// availability failures distinct from application errors so callers receive a
// useful 503 instead of a misleading internal-server-error response.
export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 503,
  ) {
    super(message)
    this.name = 'AiServiceError'
  }
}
