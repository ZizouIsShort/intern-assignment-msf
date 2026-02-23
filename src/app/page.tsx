"use client";

import { useState } from "react";

type AnalysisType = {
  tone: string;
  confidence: string;
  positives: string[];
  concerns: string[];
  forward_guidance: string;
  growth_initiatives: string[];
};

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("No file selected");
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
      setStatus(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    setStatus("Uploading...");
    setAnalysis(null);

    try {
      const { GoogleGenAI } = await import("@google/genai");

      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
      });

      // Upload file directly to Gemini
      const uploadedFile = await ai.files.upload({
        file: file,
        config: { mimeType: "application/pdf" },
      });

      setStatus("Analyzing...");

      const raw = await ai.models.generateContent({
        model: "gemini-1.5-flash",
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

      let response = raw.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      response = response.replace(/^```json\s*/, "");
      response = response.replace(/^```\s*/, "");
      response = response.replace(/```$/, "");

      const parsed = JSON.parse(response);

      setAnalysis(parsed);
      setStatus("Upload successful!");
      setFile(null);
    } catch (error) {
      console.error(error);
      setStatus("Error processing file");
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 font-sans p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-5 sm:gap-6 text-center">
        <label className="cursor-pointer group w-full flex justify-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
          />
          <div className="px-6 sm:px-8 py-3 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-white hover:text-black transition-all duration-300 text-sm sm:text-base w-full sm:w-auto text-center">
            {file ? "Change PDF" : "Upload PDF"}
          </div>
        </label>

        <div className="w-full">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">
            Status
          </p>
          <p className="text-sm font-medium text-zinc-200 truncate w-full">
            {status}
          </p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => {
              setFile(null);
              setStatus("No file selected");
              setAnalysis(null);
            }}
            className="text-[10px] uppercase tracking-widest hover:text-red-400 transition-colors"
          >
            [ Reset ]
          </button>

          {file && (
            <button
              onClick={handleUpload}
              className="text-[10px] uppercase tracking-widest text-blue-400 hover:text-blue-200 transition-colors animate-pulse"
            >
              [ Send It ]
            </button>
          )}
        </div>

        {analysis && (
          <div className="w-full mt-6 text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">
              Analysis
            </p>

            <div className="text-xs sm:text-sm text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 whitespace-pre-wrap overflow-auto max-h-[300px] sm:max-h-[400px] space-y-3">
              <div>
                <span className="opacity-50">Tone:</span> {analysis.tone}
              </div>

              <div>
                <span className="opacity-50">Confidence:</span>{" "}
                {analysis.confidence}
              </div>

              <div>
                <span className="opacity-50">Positives:</span>
                <ul className="list-disc ml-4">
                  {analysis.positives.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="opacity-50">Concerns:</span>
                <ul className="list-disc ml-4">
                  {analysis.concerns.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="opacity-50">Forward Guidance:</span>
                <div>{analysis.forward_guidance}</div>
              </div>

              <div>
                <span className="opacity-50">Growth Initiatives:</span>
                <ul className="list-disc ml-4">
                  {analysis.growth_initiatives.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
