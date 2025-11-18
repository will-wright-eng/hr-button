import { TextGenerationRequest, TextGenerationResponse } from "../types";
import { DEFAULT_GEMINI_MODEL } from "../config";
import { ApiError } from "../utils/errors";

export class GeminiClient {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
  }

  async generateText(
    request: TextGenerationRequest,
  ): Promise<TextGenerationResponse> {
    const model = request.model || DEFAULT_GEMINI_MODEL;
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.prompt,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.createError(response.status, data);
      }

      return this.parseResponse(data, model);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        code: "GEMINI_REQUEST_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      });
    }
  }

  private parseResponse(data: any, model: string): TextGenerationResponse {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new ApiError({
        code: "GEMINI_NO_RESPONSE",
        message: "No text generated in response",
        statusCode: 500,
      });
    }

    return {
      text,
      model,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            completionTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
      metadata: data,
    };
  }

  private createError(statusCode: number, data: any): ApiError {
    const code =
      statusCode === 401 || statusCode === 403
        ? "GEMINI_AUTH_ERROR"
        : statusCode === 429
          ? "GEMINI_RATE_LIMIT"
          : "GEMINI_API_ERROR";

    return new ApiError({
      code,
      message: data.error?.message || `Gemini API error: ${statusCode}`,
      statusCode,
      details: data.error || data,
    });
  }
}
