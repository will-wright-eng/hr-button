// Request types
export interface TextGenerationRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AudioGenerationRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  outputFormat?: string;
  voiceSettings?: VoiceSettings;
}

export interface CombinedRequest {
  prompt: string;
  model?: string;
  generateAudio?: boolean;
  voiceId?: string;
  audioSettings?: Partial<AudioGenerationRequest>;
}

// Response types
export interface TextGenerationResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

export interface AudioGenerationResponse {
  audioData: string; // base64
  format: string;
  voiceId: string;
  size: number;
}

export interface CombinedResponse {
  text: TextGenerationResponse;
  audio?: AudioGenerationResponse;
  audioError?: string;
  audioErrorDetails?: string;
}

// Error types
export interface ApiErrorData {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

// Voice settings type (used in AudioGenerationRequest)
export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}
