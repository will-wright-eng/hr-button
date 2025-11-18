export const GEMINI_MODELS = {
  FLASH_EXP: "gemini-2.0-flash-exp",
  PRO: "gemini-pro",
  PRO_VISION: "gemini-pro-vision",
} as const;

export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS.FLASH_EXP;

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];
