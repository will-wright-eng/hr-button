import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validate API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set in environment variables' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, model = 'gemini-2.0-flash-exp' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required in request body' },
        { status: 400 }
      );
    }

    // Call Gemini API for text completions
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    const data = await response.json();

    // Check if API key is invalid
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            error: 'Invalid GEMINI_API_KEY. Please check your API key.',
            details: data.error || data
          },
          { status: response.status }
        );
      }
      return NextResponse.json(
        {
          error: 'Gemini API error',
          details: data.error || data
        },
        { status: response.status }
      );
    }

    // Extract the generated text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return NextResponse.json({
      success: true,
      model: model,
      response: generatedText,
      fullResponse: data
    }, { status: 200 });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

