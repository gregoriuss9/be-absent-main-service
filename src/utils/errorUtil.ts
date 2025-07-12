export class AuthenticationError extends Error {
  status: number = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
    this.status = 401;
  }
}

export class ValidationError extends Error {
  status: number = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
  }
}
