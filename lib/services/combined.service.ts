import { ICombinedService, CombinedRequest, CombinedResponse } from "../types";
import { TextGenerationService } from "./text-generation.service";
import { AudioGenerationService } from "./audio-generation.service";

export class CombinedService implements ICombinedService {
  private textService: TextGenerationService;
  private audioService: AudioGenerationService;

  constructor(
    textService?: TextGenerationService,
    audioService?: AudioGenerationService,
  ) {
    this.textService = textService || new TextGenerationService();
    this.audioService = audioService || new AudioGenerationService();
  }

  async generateTextWithAudio(
    request: CombinedRequest,
  ): Promise<CombinedResponse> {
    // Step 1: Generate text
    const textResponse = await this.textService.generateText({
      prompt: request.prompt,
      model: request.model,
    });

    const result: CombinedResponse = {
      text: textResponse,
    };

    // Step 2: Optionally generate audio
    if (request.generateAudio) {
      try {
        const audioResponse = await this.audioService.generateAudio({
          text: textResponse.text,
          voiceId: request.voiceId,
          ...request.audioSettings,
        });
        result.audio = audioResponse;
      } catch (error) {
        // Don't fail entire request if audio fails
        const errorMessage =
          error instanceof Error ? error.message : "Audio generation failed";
        result.audioError = errorMessage;

        // If it's an ApiError, include details
        if (error && typeof error === "object" && "code" in error) {
          result.audioErrorDetails = JSON.stringify(error);
        }
      }
    }

    return result;
  }
}
