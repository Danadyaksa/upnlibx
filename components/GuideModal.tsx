"use client";

import React from "react";
import { X, Wifi, Search, ExternalLink, Copy, Check, ArrowRight } from "lucide-react";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseSampleUrl: (url: string) => void;
}

export default function GuideModal({ isOpen, onClose, onUseSampleUrl }: GuideModalProps) {
  const [copied, setCopied] = React.useState(false);

  const sampleUrl =
    "http://192.168.36.203/libsys_digit_upnvyk/opac/index.php/home/open?a2Ri=dXBueWs=&kzbd=00010992&file=Skripsi_Teknik_Informatika_UPNVYK.pdf&token=9fa4a20b12c5890e";

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Panduan Mendapatkan Tautan Dokumen</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Ikuti 4 langkah mudah berikut untuk mengambil link skripsi dari OPAC UPN.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Step 1 */}
          <div className="flex gap-4 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-emerald-400" />
                Terhubung ke Wi-Fi / Intranet Kampus UPN
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Server OPAC <code className="text-emerald-300 font-mono">192.168.36.203</code> adalah IP internal kampus. Pastikan laptop/ponsel Anda terhubung ke jaringan <strong>UPN-Free</strong>, <strong>UPN-Hotspot</strong>, atau <strong>Eduroam UPN</strong> di perpustakaan atau area kampus.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-emerald-400" />
                Buka Katalog OPAC &amp; Cari Judul Skripsi
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Buka browser Anda dan akses katalog digital library:
                <br />
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-zinc-800 text-emerald-300 font-mono text-[11px]">
                  http://192.168.36.203/libsys_digit_upnvyk/opac/
                </span>
                <br />
                Cari judul skripsi, nama penulis, atau topik tugas akhir yang Anda butuhkan.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
              3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                Klik &quot;Open File&quot; &amp; Salin URL Browser
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Di halaman detail karya, klik tombol <strong>&quot;Open File&quot;</strong>. Saat lembaran dokumen mulai terbuka di layar browser Anda, salin seluruh URL di address bar.
              </p>
            </div>
          </div>

          {/* Step 4: Sample format */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-300">
                Contoh Format URL Lengkap:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Tersalin!" : "Salin URL"}</span>
              </button>
            </div>
            <code className="block text-[11px] font-mono text-zinc-300 bg-zinc-900/90 p-2.5 rounded-lg break-all border border-zinc-800">
              {sampleUrl}
            </code>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onUseSampleUrl("demo");
              onClose();
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
          >
            Atau gunakan Mode Demo untuk mencoba sekarang →
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <span>Saya Mengerti</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
