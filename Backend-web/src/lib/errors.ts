// Thrown by the Zod checks in src/schemas/* — errorMiddleware maps this to a
// 400 with the readable message, instead of letting a raw Postgres CHECK
// violation (or an unhandled Zod error) surface as an opaque 500.
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
