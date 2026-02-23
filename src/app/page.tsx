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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Upload successful!");

        // FIXED LOGIC ONLY HERE
        if (data.respone) {
          try {
            let cleaned = data.respone.trim();

            cleaned = cleaned.replace(/^```json\s*/, "");
            cleaned = cleaned.replace(/^```\s*/, "");
            cleaned = cleaned.replace(/```$/, "");

            const parsed: AnalysisType = JSON.parse(cleaned);

            setAnalysis(parsed);
          } catch (err) {
            console.error("Parse failed:", err);
            console.log("Raw Gemini output:", data.respone);
            setStatus("Failed to parse analysis");
          }
        }

        setFile(null);
      } else {
        setStatus("Upload failed.");
      }
    } catch {
      setStatus("Error connecting to server.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 font-sans p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <label className="cursor-pointer group">
          <input
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
          />
          <div className="px-8 py-3 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-white hover:text-black transition-all duration-300">
            {file ? "Change PDF" : "Upload PDF"}
          </div>
        </label>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">
            Status
          </p>
          <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">
            {status}
          </p>
        </div>

        <div className="flex gap-4">
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
          <div className="w-full max-w-md mt-6 text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">
              Analysis
            </p>

            <div className="text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg p-4 whitespace-pre-wrap overflow-auto max-h-[400px] space-y-3">
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
