import {
  IAudioGenerationService,
  AudioGenerationRequest,
  AudioGenerationResponse,
} from "../types";
import { ElevenLabsClientWrapper } from "../clients/elevenlabs.client";

export class AudioGenerationService implements IAudioGenerationService {
  private client: ElevenLabsClientWrapper;

  constructor(client?: ElevenLabsClientWrapper) {
    this.client = client || new ElevenLabsClientWrapper();
  }

  async generateAudio(
    request: AudioGenerationRequest,
  ): Promise<AudioGenerationResponse> {
    // Add any business logic here (text preprocessing, validation, etc.)
    return this.client.generateAudio(request);
  }
}
