# Code Organization Design Document

## Overview

This document outlines the architecture for organizing code with clear interfaces between API calls, prompts, and business logic. The goal is to create a maintainable, testable, and extensible codebase.

## Current State Analysis

### Issues Identified

1. **Tight Coupling**: API route directly contains API-specific implementation details
2. **Hardcoded Values**: Prompts, model IDs, and configuration scattered throughout code
3. **No Abstraction**: Direct API calls in route handlers make testing difficult
4. **Mixed Concerns**: Business logic, API calls, and error handling intertwined
5. **No Type Safety**: Using `any` types and loose interfaces
6. **Prompt Management**: No centralized prompt management system

### Current Structure

```
app/
├── api/
│   └── test-endpoint/
│       └── route.ts (contains all API logic)
└── page.tsx (contains hardcoded prompts)
```

## Proposed Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (React Components / API Routes)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer               │
│  (Business Logic / Orchestration)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      API Client Layer               │
│  (Gemini, Eleven Labs Clients)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Configuration Layer            │
│  (Prompts, Models, Settings)        │
└─────────────────────────────────────┘
```

## Directory Structure

```
app/
├── api/
│   └── test-endpoint/
│       └── route.ts (thin handler)
├── page.tsx
└── ...

lib/
├── services/
│   ├── text-generation.service.ts
│   ├── audio-generation.service.ts
│   └── index.ts
├── clients/
│   ├── gemini.client.ts
│   ├── elevenlabs.client.ts
│   └── index.ts
├── prompts/
│   ├── templates.ts
│   ├── builders.ts
│   └── index.ts
├── types/
│   ├── api.types.ts
│   ├── service.types.ts
│   └── index.ts
├── config/
│   ├── models.config.ts
│   ├── voices.config.ts
│   └── index.ts
└── utils/
    ├── errors.ts
    ├── validation.ts
    └── index.ts
```

## Component Design

### 1. Type Definitions (`lib/types/`)

#### API Types (`api.types.ts`)

```typescript
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
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}
```

#### Service Types (`service.types.ts`)

```typescript
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
```

### 2. Configuration (`lib/config/`)

#### Models Config (`models.config.ts`)

```typescript
export const GEMINI_MODELS = {
  FLASH_EXP: "gemini-2.0-flash-exp",
  PRO: "gemini-pro",
  PRO_VISION: "gemini-pro-vision",
} as const;

export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS.FLASH_EXP;

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];
```

#### Voices Config (`voices.config.ts`)

```typescript
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
```

### 3. Prompt Management (`lib/prompts/`)

#### Prompt Templates (`templates.ts`)

```typescript
export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables?: string[];
  description?: string;
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  GREETING: {
    id: "greeting",
    name: "Greeting",
    template: "Say hello and tell me a fun fact about {topic} in one sentence.",
    variables: ["topic"],
    description: "Generates a friendly greeting with a fact",
  },
  EXPLAIN: {
    id: "explain",
    name: "Explanation",
    template: "Explain {concept} in simple terms suitable for {audience}.",
    variables: ["concept", "audience"],
  },
  // Add more templates as needed
};

export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[id];
}
```

#### Prompt Builders (`builders.ts`)

```typescript
import { PromptTemplate, getPromptTemplate } from "./templates";

export class PromptBuilder {
  private template: PromptTemplate;
  private variables: Map<string, string> = new Map();

  constructor(templateId: string) {
    const template = getPromptTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    this.template = template;
  }

  setVariable(name: string, value: string): this {
    this.variables.set(name, value);
    return this;
  }

  setVariables(vars: Record<string, string>): this {
    Object.entries(vars).forEach(([key, value]) => {
      this.variables.set(key, value);
    });
    return this;
  }

  build(): string {
    let prompt = this.template.template;

    // Replace variables in template
    this.variables.forEach((value, key) => {
      prompt = prompt.replace(`{${key}}`, value);
    });

    // Validate all variables are replaced
    const missingVars = prompt.match(/{(\w+)}/g);
    if (missingVars) {
      throw new Error(`Missing variables: ${missingVars.join(", ")}`);
    }

    return prompt;
  }

  static fromString(text: string): PromptBuilder {
    // Create a builder from raw text
    const builder = Object.create(PromptBuilder.prototype);
    builder.template = { id: "custom", name: "Custom", template: text };
    builder.variables = new Map();
    return builder;
  }
}

// Usage example:
// const prompt = new PromptBuilder('GREETING')
//   .setVariable('topic', 'AI')
//   .build();
```

### 4. API Clients (`lib/clients/`)

#### Gemini Client (`gemini.client.ts`)

```typescript
import {
  TextGenerationRequest,
  TextGenerationResponse,
  ApiError,
} from "../types";
import { DEFAULT_GEMINI_MODEL } from "../config";

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
```

#### Eleven Labs Client (`elevenlabs.client.ts`)

```typescript
import { ElevenLabsClient as SDKClient } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";
import {
  AudioGenerationRequest,
  AudioGenerationResponse,
  ApiError,
} from "../types";
import { DEFAULT_VOICE, DEFAULT_VOICE_SETTINGS } from "../config";

export class ElevenLabsClientWrapper {
  private client: SDKClient;
  private defaultModelId = "eleven_multilingual_v2";
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
      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        text: request.text,
        modelId: request.modelId || this.defaultModelId,
        outputFormat: request.outputFormat || this.defaultOutputFormat,
        voiceSettings: request.voiceSettings || DEFAULT_VOICE_SETTINGS,
      });

      // Convert ReadableStream to buffer
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
```

### 5. Services (`lib/services/`)

#### Text Generation Service (`text-generation.service.ts`)

```typescript
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
```

#### Audio Generation Service (`audio-generation.service.ts`)

```typescript
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
```

#### Combined Service (`combined.service.ts`)

```typescript
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
        result.audioError =
          error instanceof Error ? error.message : "Audio generation failed";
      }
    }

    return result;
  }
}
```

### 6. Error Handling (`lib/utils/errors.ts`)

```typescript
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor({
    code,
    message,
    statusCode,
    details,
  }: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      error: this.code,
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
      error: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    },
  };
}
```

### 7. Updated API Route (`app/api/test-endpoint/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { CombinedService } from "@/lib/services";
import { handleApiError } from "@/lib/utils/errors";
import { CombinedRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: CombinedRequest = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "PROMPT_REQUIRED", message: "Prompt is required" },
        { status: 400 },
      );
    }

    const service = new CombinedService();
    const result = await service.generateTextWithAudio(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}
```

### 8. Updated Frontend (`app/page.tsx`)

```typescript
"use client";

import { useState } from "react";
import { PromptBuilder } from "@/lib/prompts";
import { CombinedRequest, CombinedResponse } from "@/lib/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CombinedResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleButtonClick = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      // Use prompt builder for structured prompts
      const prompt = new PromptBuilder("GREETING")
        .setVariable("topic", "AI")
        .build();

      const request: CombinedRequest = {
        prompt,
        generateAudio: true,
      };

      const res = await fetch("/api/test-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || `Error: ${res.status}`);
      } else {
        setResponse(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

## Benefits

### 1. **Separation of Concerns**

- API routes are thin handlers
- Business logic in services
- API details in clients
- Configuration centralized

### 2. **Testability**

- Services can be unit tested with mock clients
- Clients can be tested independently
- Prompts can be tested separately

### 3. **Maintainability**

- Changes to API structure isolated to clients
- Prompt changes centralized
- Easy to add new features

### 4. **Type Safety**

- Strong typing throughout
- Compile-time error checking
- Better IDE support

### 5. **Extensibility**

- Easy to add new prompt templates
- Easy to add new services
- Easy to swap implementations

### 6. **Reusability**

- Services can be used across different routes
- Clients can be shared
- Prompts can be reused

## Migration Plan

### Phase 1: Setup Structure

1. Create directory structure
2. Set up TypeScript types
3. Create configuration files

### Phase 2: Extract Clients

1. Create Gemini client
2. Create Eleven Labs client
3. Test clients independently

### Phase 3: Create Services

1. Create text generation service
2. Create audio generation service
3. Create combined service

### Phase 4: Prompt Management

1. Create prompt templates
2. Create prompt builder
3. Migrate existing prompts

### Phase 5: Refactor Routes

1. Update API route to use services
2. Update frontend to use new types
3. Test end-to-end

### Phase 6: Error Handling

1. Implement error classes
2. Add error handling utilities
3. Update error responses

## Implementation Checklist

- [ ] Create directory structure
- [ ] Define TypeScript types
- [ ] Create configuration files
- [ ] Implement Gemini client
- [ ] Implement Eleven Labs client
- [ ] Create error handling utilities
- [ ] Implement text generation service
- [ ] Implement audio generation service
- [ ] Implement combined service
- [ ] Create prompt templates
- [ ] Create prompt builder
- [ ] Refactor API route
- [ ] Update frontend
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Update documentation
