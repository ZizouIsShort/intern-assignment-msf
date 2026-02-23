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

    const arrayBuffer = await file.arrayBuffer();
    const base64PDF = Buffer.from(arrayBuffer).toString("base64");

    const raw = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64PDF,
          },
        },
        {
          text: `
You are a financial research analyst.

Analyze the earnings call transcript and return JSON in this format:

{
  "tone": "...",
  "confidence": "...",
  "positives": ["..."],
  "concerns": ["..."],
  "forward_guidance": "...",
  "growth_initiatives": ["..."]
}
`,
        },
      ],
    });

    const llmResponse = raw.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log(llmResponse);
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
