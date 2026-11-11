"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Link2,
  X,
  FileDown,
  Loader2,
  AlertCircle,
  Eye,
  Download,
  RotateCcw,
  Check,
  Code2,
  Puzzle,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { parseUpnUrl } from "@/lib/upn-parser";
import { formatBytes } from "@/lib/utils";

interface ExtractorResult {
  filename: string;
  totalPages: number;
  rawPages: number;
  blobUrl: string;
  blobSize: number;
  isDemo: boolean;
}

interface ExtractorCardProps {
  onOpenPreview: (blobUrl: string, filename: string) => void;
  externalUrl?: string;
  onClearExternalUrl?: () => void;
  onSaveHistory?: (item: {
    filename: string;
    totalPages: number;
    timestamp: number;
    url: string;
  }) => void;
}

const STEPS = [
  "Menghubungi server / membaca dokumen...",
  "Mengambil payload gambar Base64...",
  "Menghapus duplikasi rendering server...",
  "Menyusun halaman PDF A4...",
  "Menyiapkan berkas...",
];

export default function ExtractorCard({
  onOpenPreview,
  externalUrl,
  onClearExternalUrl,
  onSaveHistory,
}: ExtractorCardProps) {
  const [mode, setMode] = useState<"url" | "html">("url");
  const [url, setUrl] = useState("");
  const [htmlInput, setHtmlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractorResult | null>(null);
  const [pasted, setPasted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalUrl) {
      setMode("url");
      setUrl(externalUrl);
      if (onClearExternalUrl) onClearExternalUrl();
      if (inputRef.current) inputRef.current.focus();
    }
  }, [externalUrl, onClearExternalUrl]);

  const parsed = parseUpnUrl(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (mode === "url") {
          setUrl(text.trim());
        } else {
          setHtmlInput(text);
        }
        setPasted(true);
        setTimeout(() => setPasted(false), 1500);
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    if (mode === "url") {
      setUrl("");
    } else {
      setHtmlInput("");
    }
    setError(null);
    inputRef.current?.focus();
  };

  // Client-side HTML extraction (runs 100% in user's browser, never touches server)
  const handleExtractFromHtml = async () => {
    if (!htmlInput.trim()) {
      setError("Tempelkan kode sumber HTML (Ctrl+U dari halaman OPAC) terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(1);

    try {
      await new Promise((r) => setTimeout(r, 150));

      // 1. Extract title
      let filename = "Dokumen-UPN.pdf";
      const titleMatch =
        htmlInput.match(/<title>Open File - (.*?)<\/title>/i) ||
        htmlInput.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const cleanName = titleMatch[1]
          .replace(/^Open File\s*-\s*/i, "")
          .replace(/[\\/:*?"<>|]/g, "")
          .trim();
        if (cleanName) {
          filename = cleanName.toLowerCase().endsWith(".pdf")
            ? cleanName
            : `${cleanName}.pdf`;
        }
      }

      // 2. Extract base64 images
      const imgRegex = /<img[^>]+src=['"]data:image\/[^;]+;base64,([^'"]+)['"]/gi;
      const rawMatches: string[] = [];
      let match;
      while ((match = imgRegex.exec(htmlInput)) !== null) {
        if (match[1] && match[1].length > 100) {
          rawMatches.push(match[1].trim());
        }
      }

      if (rawMatches.length === 0) {
        throw new Error(
          "Tidak ditemukan gambar Base64 di dalam kode HTML yang ditempel. Pastikan Anda menekan Ctrl+U pada halaman 'Open File' dokumen OPAC."
        );
      }

      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 100));

      // 3. Deduplicate sequential identical images
      const uniquePages: string[] = [];
      for (let i = 0; i < rawMatches.length; i++) {
        if (i === 0 || rawMatches[i] !== rawMatches[i - 1]) {
          uniquePages.push(rawMatches[i]);
        }
      }

      setCurrentStep(3);

      // 4. Build A4 PDF in browser
      const pdfDoc = await PDFDocument.create();
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;

      for (let idx = 0; idx < uniquePages.length; idx++) {
        if (idx % 5 === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }

        const cleanB64 = uniquePages[idx].replace(/[\r\n\s]+/g, "");
        const binaryStr = window.atob(cleanB64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let j = 0; j < binaryStr.length; j++) {
          bytes[j] = binaryStr.charCodeAt(j);
        }

        let embeddedImage;
        try {
          embeddedImage = await pdfDoc.embedJpg(bytes);
        } catch {
          try {
            embeddedImage = await pdfDoc.embedPng(bytes);
          } catch {
            continue;
          }
        }

        const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        const { width: imgW, height: imgH } = embeddedImage;
        const scale = Math.min(A4_WIDTH / imgW, A4_HEIGHT / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;

        page.drawImage(embeddedImage, {
          x: (A4_WIDTH - drawW) / 2,
          y: (A4_HEIGHT - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }

      setCurrentStep(4);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      const resObj: ExtractorResult = {
        filename,
        totalPages: uniquePages.length,
        rawPages: rawMatches.length,
        blobUrl,
        blobSize: blob.size,
        isDemo: false,
      };

      setResult(resObj);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (onSaveHistory) {
        onSaveHistory({
          filename,
          totalPages: uniquePages.length,
          timestamp: Date.now(),
          url: "HTML Source",
        });
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengekstrak HTML.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || url).trim();

    if (!targetUrl) {
      setError("Masukkan tautan OPAC terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 800);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server merespon dengan status ${response.status}`);
      }

      const totalPages = parseInt(response.headers.get("X-Total-Pages") || "1", 10);
      const rawPages = parseInt(
        response.headers.get("X-Raw-Pages") || (totalPages * 2).toString(),
        10
      );
      const rawTitle = response.headers.get("X-Document-Title");
      const isDemo = response.headers.get("X-Is-Demo") === "true";

      let finalFilename = "Dokumen-UPN.pdf";
      if (rawTitle) {
        try {
          finalFilename = decodeURIComponent(rawTitle);
        } catch {
          finalFilename = rawTitle;
        }
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const resObj: ExtractorResult = {
        filename: finalFilename,
        totalPages,
        rawPages,
        blobUrl,
        blobSize: blob.size,
        isDemo,
      };

      setResult(resObj);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (onSaveHistory) {
        onSaveHistory({
          filename: finalFilename,
          totalPages,
          timestamp: Date.now(),
          url: targetUrl,
        });
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "Gagal memproses dokumen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.blobUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUrl("");
    setHtmlInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-4 space-y-3">
      {/* Extension Download Banner */}
      <div className="bg-[#101815] border border-emerald-800/60 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Puzzle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-zinc-100 block">
              Rekomendasi: Gunakan Ekstensi Browser UpnLibX (Chrome &amp; Firefox)
            </span>
            <span className="text-zinc-400 text-[11px]">
              100% bebas error jaringan server luar. Otomatis memunculkan tombol Download PDF di halaman OPAC UPN.
            </span>
          </div>
        </div>
        <a
          href="/upnlibx-extension.zip"
          download="upnlibx-extension.zip"
          className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 flex-shrink-0 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Ekstensi (.zip)</span>
        </a>
      </div>

      {/* Main Card */}
      <div className="bg-[#131619] border border-zinc-800 rounded-lg p-5">
        {!result ? (
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#0b0d0f] border border-zinc-800 rounded-md mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode("url");
                  setError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  mode === "url"
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Input Link URL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("html");
                  setError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  mode === "html"
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Tempel HTML (Anti-Gagal di Web)</span>
              </button>
            </div>

            {mode === "url" ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="upn-url" className="text-xs font-medium text-zinc-300">
                    URL Dokumen (dari halaman &quot;Open File&quot;)
                  </label>
                  {pasted && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Berhasil ditempel
                    </span>
                  )}
                </div>

                <div className="relative flex items-center bg-[#0d0f11] border border-zinc-700/80 rounded-md focus-within:border-emerald-500 transition-colors">
                  <span className="pl-3 text-zinc-500">
                    <Link2 className="w-4 h-4" />
                  </span>

                  <input
                    ref={inputRef}
                    id="upn-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isLoading) handleExtract();
                    }}
                    disabled={isLoading}
                    placeholder="http://192.168.36.203/libsys_digit_upnvyk/opac/index.php/home/open?..."
                    className="w-full py-2.5 px-2.5 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono"
                  />

                  <div className="flex items-center gap-1 pr-2">
                    {url ? (
                      <button
                        onClick={handleClear}
                        disabled={isLoading}
                        className="p-1 text-zinc-400 hover:text-zinc-200"
                        title="Hapus"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={handlePaste}
                        type="button"
                        className="px-2 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
                      >
                        Paste
                      </button>
                    )}
                  </div>
                </div>

                {url && (
                  <div className="mt-2 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center gap-2 bg-[#0d0f11] p-2 rounded border border-zinc-800/80">
                    <span className="text-zinc-500">Target:</span>
                    <span className="text-zinc-200 font-medium truncate max-w-[280px]">
                      {parsed.filename || (parsed.isDemo ? "Dokumen Demo" : "OPAC UPN")}
                    </span>
                    {parsed.token && (
                      <span className="text-zinc-500">| Token: {parsed.token.slice(0, 8)}...</span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleExtract()}
                    disabled={isLoading || !url}
                    className="flex-1 py-2 px-4 rounded text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengekstrak Dokumen...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Unduh PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setUrl("demo");
                      handleExtract("demo");
                    }}
                    disabled={isLoading}
                    className="py-2 px-3 rounded text-xs sm:text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                  >
                    Coba Contoh (Demo)
                  </button>
                </div>
              </>
            ) : (
              /* Mode: Paste HTML Source (100% Client-Side) */
              <>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="upn-html" className="text-xs font-medium text-zinc-300">
                    Tempel Kode Sumber HTML Halaman OPAC (<code className="text-emerald-400">Ctrl+U</code> &rarr; Copy All)
                  </label>
                  <button
                    onClick={handlePaste}
                    type="button"
                    className="px-2 py-0.5 text-[11px] font-mono text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
                  >
                    {pasted ? "Ditempel!" : "Paste HTML"}
                  </button>
                </div>

                <textarea
                  id="upn-html"
                  rows={4}
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="1. Buka dokumen di OPAC UPN&#10;2. Tekan Ctrl+U (View Source), lalu Ctrl+A dan Ctrl+C&#10;3. Paste seluruh teks HTML di sini..."
                  className="w-full p-2.5 bg-[#0d0f11] border border-zinc-700/80 rounded-md text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                />

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleExtractFromHtml}
                    disabled={isLoading || !htmlInput.trim()}
                    className="flex-1 py-2 px-4 rounded text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyusun PDF di Browser...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Ekstrak HTML ke PDF (Langsung di Browser)</span>
                      </>
                    )}
                  </button>
                  {htmlInput && (
                    <button
                      onClick={handleClear}
                      disabled={isLoading}
                      className="py-2 px-3 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Stepper Progress */}
            {isLoading && (
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
                  <span>{STEPS[currentStep]}</span>
                  <span>
                    {currentStep + 1}/{STEPS.length}
                  </span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p>{error}</p>
                  {mode === "url" && (
                    <p className="mt-1.5 text-zinc-300 text-[11px]">
                      💡 <strong>Solusi jika buka dari web hosting (Vercel):</strong> Gunakan tab{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("html");
                          setError(null);
                        }}
                        className="text-emerald-400 underline font-semibold"
                      >
                        Tempel HTML
                      </button>{" "}
                      di atas, atau pasang <strong>Ekstensi Browser UpnLibX</strong> agar berjalan langsung di jaringan Wi-Fi UPN laptop Anda.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Result State */
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-zinc-200">
                  {result.isDemo ? "Selesai (Dokumen Demo)" : "Ekstraksi Selesai"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {formatBytes(result.blobSize)}
              </span>
            </div>

            <div className="my-3">
              <p className="text-sm font-medium text-zinc-100 truncate">
                {result.filename}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                <span>
                  <strong className="text-zinc-200">{result.totalPages}</strong> halaman unik
                </span>
                <span>•</span>
                <span>
                  <strong className="text-emerald-400">
                    {Math.max(0, result.rawPages - result.totalPages)}
                  </strong>{" "}
                  duplikat server dieliminasi
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleDownloadAgain}
                className="py-1.5 px-3 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Ulang</span>
              </button>

              <button
                onClick={() => onOpenPreview(result.blobUrl, result.filename)}
                className="py-1.5 px-3 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau PDF</span>
              </button>

              <button
                onClick={handleReset}
                className="py-1.5 px-3 rounded text-xs font-medium bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 ml-auto flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ekstrak Lagi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
