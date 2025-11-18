# Text-to-Speech Integration Design Document

## Overview

This document outlines the design for integrating Eleven Labs Text-to-Speech (TTS) API to convert Gemini API text responses into audio files that can be played in the browser.

## Objectives

- Convert Gemini API text responses to audio using Eleven Labs TTS
- Provide audio playback controls in the UI
- Handle errors gracefully
- Maintain good user experience with loading states

## Architecture

### Current Flow

```
User Input → Gemini API → Text Response → Display in UI
```

### New Flow

```
User Input → Gemini API → Text Response → Eleven Labs TTS → Audio File → Play in Browser
```

## Components

### 1. Backend API Route (`/api/test-endpoint/route.ts`)

**Current State:**

- Receives prompt from client
- Calls Gemini API
- Returns text response

**New Functionality:**

- After receiving Gemini response, optionally call Eleven Labs TTS API
- Return both text and audio data (base64 or URL)

**Option A: Sequential Processing (Recommended)**

- Generate text first
- If TTS requested, convert text to speech
- Return both text and audio in single response

**Option B: Separate Endpoint**

- Keep text generation separate
- Create new `/api/text-to-speech` endpoint
- Client calls both endpoints sequentially

**Decision: Option A** - Single endpoint with optional TTS parameter for better UX

### 2. Eleven Labs API Integration

#### API Details

- **Endpoint:** `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- **Authentication:** `xi-api-key` header
- **Request Format:**
  ```json
  {
    "text": "Text to convert",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.8,
      "style": 0.0,
      "use_speaker_boost": true
    }
  }
  ```
- **Response:** Audio file (MP3 format by default)
- **Content-Type:** `audio/mpeg`

#### Voice Selection

- Default voice: `21m00Tcm4TlvDq8ikWAM` (Rachel - recommended default)
- Allow voice selection via API parameter (future enhancement)
- Voice list available via `GET /v1/voices`

#### Text Length Considerations

- Eleven Labs has character limits per request
- For long texts, may need to split into chunks
- Initial implementation: handle single request (up to ~5000 characters)

### 3. Frontend Components (`app/page.tsx`)

#### New State Variables

- `audioUrl: string | null` - URL for audio playback
- `audioLoading: boolean` - Loading state for TTS generation
- `isPlaying: boolean` - Audio playback state
- `audioError: string | null` - TTS-specific errors

#### New UI Elements

1. **Toggle/Checkbox:** "Generate audio" option
2. **Audio Player:**
   - Play/Pause button
   - Progress indicator (optional)
   - Download button (optional)
3. **Loading Indicator:** Show when generating audio

#### Audio Playback Implementation

- Use HTML5 `<audio>` element
- Create blob URL from base64 audio data
- Handle audio events (play, pause, ended)

### 4. Data Flow

#### Request Format

```typescript
{
  prompt: string;
  model?: string; // Gemini model
  generateAudio?: boolean; // TTS flag
  voiceId?: string; // Optional voice selection
}
```

#### Response Format

```typescript
{
  success: boolean;
  model: string;
  response: string; // Text response
  audio?: {
    data: string; // Base64 encoded audio
    format: string; // "mp3"
    voiceId: string;
  };
  fullResponse?: object; // Full Gemini response
}
```

## Implementation Details

### Backend Changes

#### Environment Variables

- `ELEVEN_LABS_API_KEY` - Required for TTS functionality

#### API Route Modifications

1. Add Eleven Labs API key validation
2. After Gemini response, check if `generateAudio` is true
3. Call Eleven Labs API with generated text
4. Convert audio response to base64
5. Include audio data in response

#### Error Handling

- Handle missing Eleven Labs API key gracefully
- Handle TTS API errors (rate limits, invalid voice, etc.)
- Return partial success if text generation succeeds but TTS fails

### Frontend Changes

#### Audio Generation Flow

1. User clicks "Call API" with audio option enabled
2. Show loading state for both text and audio
3. Receive response with audio data
4. Create blob URL from base64 audio
5. Display audio player controls

#### Audio Player Component

```typescript
// Pseudo-code structure
const AudioPlayer = ({ audioUrl, isPlaying, onPlay, onPause }) => {
  return (
    <div>
      <audio src={audioUrl} ref={audioRef} />
      <button onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};
```

## Security Considerations

1. **API Key Protection:**
   - Eleven Labs API key stored in `.env.local`
   - Never exposed to client
   - All TTS calls made server-side

2. **Rate Limiting:**
   - Be aware of Eleven Labs rate limits
   - Implement client-side debouncing if needed
   - Handle 429 (Too Many Requests) errors

3. **Content Validation:**
   - Validate text length before sending to TTS
   - Sanitize user input (already handled by Gemini)

## Error Handling

### Scenarios to Handle

1. **Missing Eleven Labs API Key:**
   - Return error message
   - Allow text-only response

2. **TTS API Failure:**
   - Log error
   - Return text response with error message
   - Don't fail entire request

3. **Invalid Voice ID:**
   - Fall back to default voice
   - Log warning

4. **Text Too Long:**
   - Truncate or split text
   - Show warning to user

5. **Audio Playback Failure:**
   - Show error message
   - Provide download option as fallback

## User Experience

### Loading States

- Show separate loading indicators for:
  - Text generation
  - Audio generation
- Display progress: "Generating text..." → "Converting to speech..."

### Audio Controls

- Play/Pause button (prominent)
- Visual feedback when playing
- Optional: Progress bar, volume control, playback speed

### Error Messages

- Clear, user-friendly error messages
- Distinguish between text generation and audio generation errors
- Provide actionable feedback

## Testing Strategy

### Unit Tests

- Test API route with/without TTS flag
- Test error handling scenarios
- Test audio blob creation

### Integration Tests

- Test full flow: prompt → text → audio → playback
- Test with invalid API keys
- Test with various text lengths

### Manual Testing

- Test with different voices
- Test audio playback on different browsers
- Test error scenarios

## Future Enhancements

1. **Voice Selection:**
   - Dropdown to select from available voices
   - Preview voices before selection

2. **Audio Settings:**
   - Adjust stability, similarity boost
   - Select different models

3. **Advanced Features:**
   - Streaming audio generation
   - Audio download option
   - Playback speed control
   - Multiple language support

4. **Performance:**
   - Cache audio for repeated requests
   - Optimize base64 encoding/decoding
   - Consider using audio URLs instead of base64

## Implementation Checklist

- [ ] Add `ELEVEN_LABS_API_KEY` to environment variables
- [ ] Update backend API route to support TTS
- [ ] Add Eleven Labs API integration
- [ ] Handle audio response (base64 conversion)
- [ ] Update frontend to include audio generation option
- [ ] Implement audio player component
- [ ] Add loading states for audio generation
- [ ] Implement error handling for TTS
- [ ] Test with valid API key
- [ ] Test error scenarios
- [ ] Update UI styling for audio controls
- [ ] Add documentation/comments

## API Reference

### Eleven Labs TTS Endpoint

- **URL:** `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- **Method:** POST
- **Headers:**
  - `xi-api-key`: Your API key
  - `Content-Type`: application/json
- **Body:**
  ```json
  {
    "text": "string",
    "model_id": "string",
    "voice_settings": {
      "stability": number,
      "similarity_boost": number
    }
  }
  ```
- **Response:** Audio file (MP3)

### Default Voice IDs

- Rachel: `21m00Tcm4TlvDq8ikWAM`
- Domi: `AZnzlk1XvdvUeBnXmlld`
- Bella: `EXAVITQu4vr4xnSDxMaL`

## Notes

- Eleven Labs free tier has usage limits
- Audio files are typically 1-2MB for short texts
- Consider implementing audio caching for repeated requests
- Base64 encoding increases payload size by ~33%
