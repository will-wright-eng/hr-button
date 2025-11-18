import { NextRequest, NextResponse } from "next/server";
import { CombinedService } from "@/lib/services";
import { handleApiError } from "@/lib/utils/errors";
import { CombinedRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: CombinedRequest = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        {
          code: "PROMPT_REQUIRED",
          message: "Prompt is required",
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    const service = new CombinedService();
    const result = await service.generateTextWithAudio(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const { status, body: errorBody } = handleApiError(error);
    return NextResponse.json(errorBody, { status });
  }
}
