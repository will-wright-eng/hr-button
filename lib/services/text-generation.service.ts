import {
  ITextGenerationService,
  TextGenerationRequest,
  TextGenerationResponse,
} from "../types";
import { GeminiClient } from "../clients/gemini.client";

export class TextGenerationService implements ITextGenerationService {
  private client: GeminiClient;

  constructor(client?: GeminiClient) {
    this.client = client || new GeminiClient();
  }

  async generateText(
    request: TextGenerationRequest,
  ): Promise<TextGenerationResponse> {
    // Add any business logic here (validation, transformation, etc.)
    return this.client.generateText(request);
  }
}
