"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Link2,
  ClipboardPaste,
  X,
  FileDown,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  Download,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
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

const EXTRACTION_STEPS = [
  { id: 1, label: "Menghubungkan ke Intranet UPN (192.168.36.203)...", duration: 800 },
  { id: 2, label: "Mengekstrak lembaran gambar dokumen Base64...", duration: 1200 },
  { id: 3, label: "Membersihkan bug duplikasi rendering server...", duration: 1000 },
  { id: 4, label: "Merangkai dokumen PDF A4 dengan pdf-lib...", duration: 1500 },
  { id: 5, label: "Menyelesaikan berkas unduhan...", duration: 600 },
];

export default function ExtractorCard({
  onOpenPreview,
  externalUrl,
  onClearExternalUrl,
  onSaveHistory,
}: ExtractorCardProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractorResult | null>(null);
  const [pasteNotification, setPasteNotification] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external URL (e.g. from Guide or Demo)
  useEffect(() => {
    if (externalUrl) {
      setUrl(externalUrl);
      if (onClearExternalUrl) onClearExternalUrl();
      if (inputRef.current) inputRef.current.focus();
    }
  }, [externalUrl, onClearExternalUrl]);

  // Real-time URL parsing info
  const parsed = parseUpnUrl(url);

  // Auto-paste handler
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setPasteNotification(true);
        setTimeout(() => setPasteNotification(false), 2000);
      }
    } catch {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
    setErrorDetails(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#059669", "#6ee7b7", "#fef08a"],
      });
    } catch {
      // ignore
    }
  };

  const handleExtract = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || url).trim();

    if (!targetUrl) {
      setError("Silakan masukkan tautan dokumen OPAC UPN terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setResult(null);
    setCurrentStepIndex(0);

    // Simulate stepper progress while request is running
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < EXTRACTION_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Terjadi kesalahan ekstraksi (HTTP ${response.status})`
        );
      }

      // Extract metadata from headers
      const totalPages = parseInt(response.headers.get("X-Total-Pages") || "1", 10);
      const rawPages = parseInt(
        response.headers.get("X-Raw-Pages") || (totalPages * 2).toString(),
        10
      );
      const rawFilename = response.headers.get("X-Document-Title");
      const isDemo = response.headers.get("X-Is-Demo") === "true";

      let finalFilename = "Dokumen-UPN.pdf";
      if (rawFilename) {
        try {
          finalFilename = decodeURIComponent(rawFilename);
        } catch {
          finalFilename = rawFilename;
        }
      }

      // Convert to blob
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      setCurrentStepIndex(EXTRACTION_STEPS.length - 1);

      const resObj: ExtractorResult = {
        filename: finalFilename,
        totalPages,
        rawPages,
        blobUrl,
        blobSize: blob.size,
        isDemo,
      };

      setResult(resObj);
      triggerConfetti();

      // Trigger automatic file download
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Save to recent history
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
      setError(err.message || "Gagal mengekstrak dokumen.");
      if (err.message.includes("192.168.36.203") || err.message.includes("timeout")) {
        setErrorDetails(
          "Anda tampaknya tidak terhubung ke Wi-Fi internal kampus UPN 'Veteran' Yogyakarta. Alamat IP 192.168.36.203 hanya dapat diakses melalui intranet kampus."
        );
      }
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
    setErrorDetails(null);
    setUrl("");
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="relative rounded-2xl glass-panel-elevated p-5 sm:p-8 transition-all">
        {/* Glow ambient background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-green-500/20 rounded-2xl blur-lg opacity-40 pointer-events-none -z-10" />

        {/* Input Form Mode */}
        {!result ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="upn-url-input"
                className="text-xs sm:text-sm font-semibold text-zinc-200 flex items-center gap-2"
              >
                <span>Tautan Dokumen OPAC UPN</span>
                <span className="text-[11px] font-normal text-zinc-400">
                  (Salin dari halaman &quot;Open File&quot;)
                </span>
              </label>

              {pasteNotification && (
                <span className="text-xs text-emerald-400 font-medium animate-in fade-in flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tautan ditempel!
                </span>
              )}
            </div>

            {/* Input Box with actions */}
            <div className="relative flex items-center rounded-xl bg-zinc-950/90 border border-zinc-700/70 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
              <div className="pl-3.5 sm:pl-4 text-zinc-400 pointer-events-none">
                <Link2 className="w-5 h-5 text-emerald-400" />
              </div>

              <input
                ref={inputRef}
                id="upn-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleExtract();
                  }
                }}
                disabled={isLoading}
                placeholder="http://192.168.36.203/libsys_digit_upnvyk/opac/index.php/home/open?..."
                className="w-full py-3.5 px-3 bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50 font-mono tracking-tight"
              />

              <div className="flex items-center gap-1 pr-2">
                {url ? (
                  <button
                    onClick={handleClear}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Hapus URL"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handlePaste}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all active:scale-95"
                    title="Tempel dari Clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Paste</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live URL Parsing Badge */}
            {url && (
              <div className="mt-2.5 px-3 py-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-zinc-300 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-[11px] text-zinc-400">Terdeteksi:</span>
                  <span className="font-medium text-emerald-300 truncate">
                    {parsed.filename || (parsed.isDemo ? "Mode Demo Dokumen" : "Link OPAC UPN")}
                  </span>
                </div>
                {parsed.token && (
                  <span className="font-mono text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                    Token: {parsed.token.slice(0, 10)}...
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleExtract()}
                disabled={isLoading || !url}
                className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                  isLoading || !url
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-emerald-500/25 active:scale-[0.99]"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Mengekstrak Dokumen...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Ekstrak &amp; Unduh PDF</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setUrl("demo");
                  handleExtract("demo");
                }}
                disabled={isLoading}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Coba Mode Demo</span>
              </button>
            </div>

            {/* Stepper Status Feedback */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-5 border-t border-zinc-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Proses Ekstraksi Berlangsung
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Langkah {currentStepIndex + 1} dari {EXTRACTION_STEPS.length}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      initial={{ width: "10%" }}
                      animate={{
                        width: `${((currentStepIndex + 1) / EXTRACTION_STEPS.length) * 100}%`,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  {/* Active Step description */}
                  <p className="text-xs text-zinc-300 font-medium">
                    {EXTRACTION_STEPS[currentStepIndex].label}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs leading-relaxed">
                    <p className="font-semibold text-red-300">{error}</p>
                    {errorDetails && (
                      <p className="mt-1 text-zinc-400">{errorDetails}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setUrl("demo");
                          handleExtract("demo");
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        Jalankan Mode Demo Sebagai Gantinya
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Result Card Mode */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-2"
          >
            {/* Success Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 mb-2">
              {result.isDemo ? "DEMO EXTRACTION SUCCEEDED" : "EKSTRAKSI PDF BERHASIL"}
            </span>

            <h3 className="text-lg sm:text-xl font-bold text-white max-w-lg mx-auto truncate px-2">
              {result.filename}
            </h3>

            <p className="text-xs text-zinc-400 mt-1">
              File PDF telah dirangkai dan otomatis diunduh ke perangkat Anda.
            </p>

            {/* Document Stats Cards */}
            <div className="my-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-md mx-auto text-left">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-400" />
                  Halaman Unik
                </span>
                <p className="text-base font-bold text-white mt-0.5">
                  {result.totalPages}{" "}
                  <span className="text-xs font-normal text-zinc-400">lembar</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-teal-400" />
                  Duplikat Dieliminasi
                </span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">
                  {Math.max(0, result.rawPages - result.totalPages)}{" "}
                  <span className="text-xs font-normal text-zinc-400">halaman</span>
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-400" />
                  Ukuran Berkas
                </span>
                <p className="text-base font-bold text-white mt-0.5 font-mono">
                  {formatBytes(result.blobSize)}
                </p>
              </div>
            </div>

            {/* Action Buttons for Result */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleDownloadAgain}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Lagi</span>
              </button>

              <button
                onClick={() => onOpenPreview(result.blobUrl, result.filename)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all flex items-center gap-2 border border-zinc-700/60 active:scale-95"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Lihat Pratinjau PDF</span>
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 border border-zinc-800 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ekstrak Dokumen Lain</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
