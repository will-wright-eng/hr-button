export const ELEVEN_LABS_VOICES = {
  RACHEL: "JBFqnCBsd6RMkjVDRZzb",
  DOMI: "AZnzlk1XvdvUeBnXmlld",
  BELLA: "EXAVITQu4vr4xnSDxMaL",
} as const;

export const DEFAULT_VOICE = ELEVEN_LABS_VOICES.RACHEL;

export type VoiceId =
  (typeof ELEVEN_LABS_VOICES)[keyof typeof ELEVEN_LABS_VOICES];

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.8,
  use_speaker_boost: true,
};
