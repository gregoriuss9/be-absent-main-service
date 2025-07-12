interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class ResponseUtil {
  static success<T>(data: T, message?: string, meta?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta }),
    };
  }

  static error(message: string): ApiResponse<null> {
    return {
      success: false,
      message,
    };
  }

  // Helper method for validation errors
  static validationError(message: string): ApiResponse<null> {
    return this.error(message);
  }

  // Helper method for not found errors
  static notFound(resource: string): ApiResponse<null> {
    return this.error(`${resource} not found`);
  }

  // Helper method for unauthorized errors
  static unauthorized(
    message: string = "Unauthorized access"
  ): ApiResponse<null> {
    return this.error(message);
  }

  // Helper method for server errors
  static serverError(
    message: string = "Internal server error"
  ): ApiResponse<null> {
    return this.error(message);
  }
}
