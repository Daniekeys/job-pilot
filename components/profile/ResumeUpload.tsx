"use client";

import { useState, useTransition } from "react";
import { Download, FileText, Sparkles, UploadCloud } from "lucide-react";

import { uploadResume } from "@/actions/profile";
import type { Profile } from "@/types";

type Props = {
  resumePdfUrl: string | null;
  onExtracted: (data: Partial<Profile>) => void;
};

type ExtractStatus = { type: "success" | "error"; message: string };

export function ResumeUpload({ resumePdfUrl, onExtracted }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractStatus, setExtractStatus] = useState<ExtractStatus | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<ExtractStatus | null>(
    null,
  );
  // /api/resume/generate isn't a Server Action, so its DB write doesn't trigger the
  // automatic page refresh that uploadResume() gets — track the fresh signed URL locally,
  // falling back to the server-provided prop for the upload path and on next page load.
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const viewUrl = generatedUrl ?? resumePdfUrl;

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setGeneratedUrl(null);
    startTransition(async () => {
      const result = await uploadResume(file);
      if (!result.success) {
        setError(result.error ?? "Failed to upload resume.");
      }
    });
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setGenerateStatus(null);
    try {
      const response = await fetch("/api/resume/generate", { method: "POST" });
      const result: { success: boolean; url?: string; error?: string } =
        await response.json();
      if (!result.success || !result.url) {
        setGenerateStatus({
          type: "error",
          message: result.error ?? "Failed to generate resume.",
        });
        return;
      }
      setGeneratedUrl(result.url);
      setGenerateStatus({
        type: "success",
        message: "Resume generated from your profile.",
      });
    } catch {
      setGenerateStatus({
        type: "error",
        message: "Failed to generate resume.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExtract() {
    setIsExtracting(true);
    setExtractStatus(null);
    try {
      const response = await fetch("/api/resume/extract", { method: "POST" });
      const result: {
        success: boolean;
        data?: Partial<Profile>;
        error?: string;
      } = await response.json();
      if (!result.success || !result.data) {
        setExtractStatus({
          type: "error",
          message: result.error ?? "Failed to extract resume details.",
        });
        return;
      }
      onExtracted(result.data);
      setExtractStatus({
        type: "success",
        message: "Profile fields updated below. Review and save.",
      });
    } catch {
      setExtractStatus({
        type: "error",
        message: "Failed to extract resume details.",
      });
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new
        tailored one from your details below.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={
          isDragging
            ? "mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent bg-accent-muted px-6 py-10 text-center"
            : "mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center"
        }
      >
        <UploadCloud className="size-6 text-text-muted" />
        <p className="text-sm font-medium text-text-primary">
          {isPending ? "Uploading..." : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-text-muted">
          PDF formatting only. Maximum file size 5MB.
        </p>
        <label className="mt-2 cursor-pointer rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary">
          Select Resume
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={isPending}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        {viewUrl && !isPending && (
          <div className="mt-1 flex items-center gap-3">
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-dark"
            >
              <FileText className="size-3.5" />
              View current resume
            </a>
            <a
              href="/api/resume/download"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-dark"
            >
              <Download className="size-3.5" />
              Download
            </a>
          </div>
        )}
        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      {viewUrl && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            Let AI fill in the form below from this resume.
          </p>
          <button
            type="button"
            disabled={isExtracting}
            onClick={handleExtract}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:opacity-60"
          >
            <Sparkles className="size-4" />
            {isExtracting ? "Extracting..." : "Extract from Resume"}
          </button>
        </div>
      )}
      {extractStatus && (
        <p
          className={`mt-2 text-xs ${extractStatus.type === "success" ? "text-success" : "text-error"}`}
        >
          {extractStatus.message}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Generate Resume from Profile"}
        </button>
      </div>
      {generateStatus && (
        <p
          className={`mt-2 text-xs ${generateStatus.type === "success" ? "text-success" : "text-error"}`}
        >
          {generateStatus.message}
        </p>
      )}
    </div>
  );
}
