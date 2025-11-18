"use client";

import { useState, useRef, useEffect } from "react";
import { CombinedRequest, CombinedResponse } from "@/lib/types";
import { PromptBuilder } from "@/lib/prompts";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [response, setResponse] = useState<CombinedResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [generateAudio, setGenerateAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ensure component is mounted before using browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Clean up audio URL when component unmounts or audio changes
  useEffect(() => {
    return () => {
      if (audioUrl && typeof window !== "undefined") {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Handle audio playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const handleButtonClick = async () => {
    setLoading(true);
    setAudioLoading(generateAudio);
    setError("");
    setResponse(null);
    setAudioError(null);

    // Clean up previous audio URL (only on client)
    if (audioUrl && typeof window !== "undefined") {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);

    try {
      // Use prompt builder for structured prompts (or use raw string)
      // const prompt = new PromptBuilder("GREETING")
      //   .setVariable("topic", "AI")
      //   .build();
      const prompt = new PromptBuilder("HR_ADVICE").build();

      const request: CombinedRequest = {
        prompt,
        generateAudio: generateAudio,
      };

      const res = await fetch("/api/call-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data:
        | CombinedResponse
        | { code?: string; message?: string; statusCode?: number } =
        await res.json();

      if (!res.ok) {
        const errorData = data as {
          code?: string;
          message?: string;
          statusCode?: number;
        };
        setError(errorData.message || errorData.code || `Error: ${res.status}`);
      } else {
        const responseData = data as CombinedResponse;
        setResponse(responseData);

        // Handle audio if generated (only on client)
        if (
          generateAudio &&
          responseData.audio &&
          typeof window !== "undefined"
        ) {
          try {
            // Convert base64 to blob URL
            const audioData = responseData.audio.audioData;
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          } catch (audioErr) {
            setAudioError("Failed to process audio data");
            console.error("Audio processing error:", audioErr);
          }
        } else if (generateAudio && responseData.audioError) {
          setAudioError(responseData.audioError);
          if (responseData.audioErrorDetails) {
            setAudioError(
              `${responseData.audioError} - ${responseData.audioErrorDetails}`,
            );
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setAudioLoading(false);
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  return (
    <div
      style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "800px" }}
    >
      <h1>HR Assistant</h1>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        HR Assistant is here to help you with your HR questions and concerns.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={generateAudio}
            onChange={(e) => setGenerateAudio(e.target.checked)}
            disabled={loading}
            style={{ cursor: "pointer" }}
          />
          <span>Generate audio (Eleven Labs TTS)</span>
        </label>
      </div>

      <button
        onClick={handleButtonClick}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          marginBottom: "1rem",
        }}
      >
        {loading
          ? audioLoading
            ? "Generating audio..."
            : "Generating text..."
          : "Call HR!"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#fee",
            color: "#c33",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Response:</h3>
          <div
            style={{
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              color: "#666",
            }}
          >
            Model: {response.text.model}
          </div>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {response.text.text}
          </pre>
        </div>
      )}

      {audioUrl && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#f0f8ff",
            borderRadius: "4px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Audio:</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handlePlayPause}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                cursor: "pointer",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <audio ref={audioRef} src={audioUrl} style={{ display: "none" }} />
            <span style={{ color: "#666", fontSize: "0.9rem" }}>
              {isPlaying ? "Playing..." : "Ready to play"}
            </span>
          </div>
        </div>
      )}

      {audioError && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#fff3cd",
            color: "#856404",
            borderRadius: "4px",
          }}
        >
          <strong>Audio Error:</strong> {audioError}
        </div>
      )}
    </div>
  );
}
