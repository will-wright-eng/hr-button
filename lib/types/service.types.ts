import {
  TextGenerationRequest,
  TextGenerationResponse,
  AudioGenerationRequest,
  AudioGenerationResponse,
  CombinedRequest,
  CombinedResponse,
} from "./api.types";

export interface ITextGenerationService {
  generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;
}

export interface IAudioGenerationService {
  generateAudio(
    request: AudioGenerationRequest,
  ): Promise<AudioGenerationResponse>;
}

export interface ICombinedService {
  generateTextWithAudio(request: CombinedRequest): Promise<CombinedResponse>;
}
