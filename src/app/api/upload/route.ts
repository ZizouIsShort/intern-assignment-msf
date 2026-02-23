import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Upload file directly to Gemini
    const uploadedFile = await ai.files.upload({
      file: file,
      config: { mimeType: "application/pdf" },
    });

    const raw = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          fileData: {
            mimeType: "application/pdf",
            fileUri: uploadedFile.uri,
          },
        },
        {
          text: `Analyze this earnings call transcript and return JSON with tone, confidence, positives, concerns, forward_guidance, growth_initiatives.`,
        },
      ],
    });

    const llmResponse = raw.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({
      success: true,
      respone: llmResponse,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 },
    );
  }
}
