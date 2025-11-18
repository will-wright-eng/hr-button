import { ApiErrorData } from "../types";

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(data: ApiErrorData) {
    super(data.message);
    this.name = "ApiError";
    this.code = data.code;
    this.statusCode = data.statusCode;
    this.details = data.details;
  }

  toJSON(): ApiErrorData {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export function handleApiError(error: unknown): { status: number; body: any } {
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      body: error.toJSON(),
    };
  }

  return {
    status: 500,
    body: {
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      statusCode: 500,
    },
  };
}
