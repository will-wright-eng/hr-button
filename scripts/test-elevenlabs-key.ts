import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Readable } from "stream";

// Load environment variables
dotenv.config({ path: ".env.local" });

const apiKey =
  process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY;

if (!apiKey) {
  console.error(
    "❌ ELEVENLABS_API_KEY or ELEVEN_LABS_API_KEY is not set in .env.local",
  );
  process.exit(1);
}

console.log("🔑 Testing Eleven Labs API key...");
console.log(`   Key prefix: ${apiKey.substring(0, 10)}...`);

const elevenlabs = new ElevenLabsClient({
  apiKey: apiKey,
});

const testText =
  "Hello! This is a test of the Eleven Labs text-to-speech API. If you can hear this, the API key is working correctly.";
const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // Default voice from example

async function testElevenLabs() {
  try {
    console.log("📝 Converting text to speech...");
    console.log(`   Text: "${testText}"`);
    console.log(`   Voice ID: ${voiceId}`);

    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: testText,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    // Convert ReadableStream to Node.js Readable stream
    const nodeStream = Readable.fromWeb(audio as any);

    // Convert the audio stream to a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    // Save to file to verify it works
    const outputPath = path.join(process.cwd(), "test-audio-output.mp3");
    fs.writeFileSync(outputPath, audioBuffer);

    console.log("✅ Eleven Labs API key is valid!");
    console.log(`   Audio file saved to: ${outputPath}`);
    console.log(`   File size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
    console.log("\n💡 You can play the audio file to verify the quality.");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Eleven Labs API error:");

    if (error.status === 401 || error.status === 403) {
      console.error(
        "   Invalid API key. Please check your ELEVENLABS_API_KEY.",
      );
    } else if (error.status === 429) {
      console.error("   Rate limit exceeded. Please try again later.");
    } else {
      console.error(`   Error: ${error.message || JSON.stringify(error)}`);
    }

    if (error.response) {
      console.error("   Response details:", error.response);
    }

    process.exit(1);
  }
}

testElevenLabs();
