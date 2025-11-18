#!/usr/bin/env node

/**
 * Test script to verify GEMINI_API_KEY is valid
 * Usage: node test-gemini-key.js
 */

require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is not set in .env.local');
  process.exit(1);
}

console.log('🔑 Testing GEMINI_API_KEY...');
console.log(`   Key prefix: ${apiKey.substring(0, 10)}...`);

const testPrompt = 'Say "Hello, API key is valid!" in one sentence.';
const model = 'gemini-2.0-flash-exp';
const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

fetch(geminiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [{
      parts: [{
        text: testPrompt
      }]
    }]
  }),
})
  .then(async (response) => {
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Invalid GEMINI_API_KEY');
        console.error('   Error details:', JSON.stringify(data, null, 2));
        process.exit(1);
      } else {
        console.error(`❌ API Error (${response.status})`);
        console.error('   Error details:', JSON.stringify(data, null, 2));
        process.exit(1);
      }
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText) {
      console.log('✅ GEMINI_API_KEY is valid!');
      console.log(`   Model: ${model}`);
      console.log(`   Response: ${generatedText}`);
      process.exit(0);
    } else {
      console.error('❌ Unexpected response format');
      console.error('   Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Network error:', error.message);
    process.exit(1);
  });

