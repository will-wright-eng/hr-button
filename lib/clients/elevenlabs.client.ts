import { ElevenLabsClient as SDKClient } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";
import { AudioGenerationRequest, AudioGenerationResponse } from "../types";
import { DEFAULT_VOICE, DEFAULT_VOICE_SETTINGS } from "../config";
import { ApiError } from "../utils/errors";

export class ElevenLabsClientWrapper {
  private client: SDKClient;
  // private defaultModelId = "eleven_multilingual_v2";
  private defaultModelId = "eleven_v3";
  private defaultOutputFormat = "mp3_44100_128";

  constructor(apiKey?: string) {
    const key =
      apiKey ||
      process.env.ELEVENLABS_API_KEY ||
      process.env.ELEVEN_LABS_API_KEY;
    if (!key) {
      throw new Error("ELEVENLABS_API_KEY is required");
    }
    this.client = new SDKClient({ apiKey: key });
  }

  async generateAudio(
    request: AudioGenerationRequest,
  ): Promise<AudioGenerationResponse> {
    try {
      const voiceId = request.voiceId || DEFAULT_VOICE;
      const outputFormat = (request.outputFormat ||
        this.defaultOutputFormat) as "mp3_44100_128";
      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        text: request.text,
        modelId: request.modelId || this.defaultModelId,
        outputFormat: outputFormat,
        voiceSettings: request.voiceSettings || DEFAULT_VOICE_SETTINGS,
      });

      // Convert ReadableStream to Node.js Readable stream
      const nodeStream = Readable.fromWeb(audioStream as any);
      const chunks: Buffer[] = [];

      for await (const chunk of nodeStream) {
        chunks.push(Buffer.from(chunk));
      }

      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString("base64");

      return {
        audioData: audioBase64,
        format: request.outputFormat || this.defaultOutputFormat,
        voiceId,
        size: audioBuffer.length,
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      const code =
        statusCode === 401 || statusCode === 403
          ? "ELEVENLABS_AUTH_ERROR"
          : statusCode === 429
            ? "ELEVENLABS_RATE_LIMIT"
            : "ELEVENLABS_API_ERROR";

      throw new ApiError({
        code,
        message: error.message || "Eleven Labs API error",
        statusCode,
        details: error,
      });
    }
  }
}
