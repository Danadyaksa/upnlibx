"use client";

import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseSampleUrl: (url: string) => void;
}

export default function GuideModal({ isOpen, onClose, onUseSampleUrl }: GuideModalProps) {
  const [copied, setCopied] = useState(false);

  const sampleUrl =
    "http://192.168.36.203/libsys_digit_upnvyk/opac/index.php/home/open?a2Ri=dXBueWs=&kzbd=00010992&file=Skripsi_Informatika_UPNVYK.pdf&token=9fa4a20b12c5890e";

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#14171a] border border-zinc-700 rounded-lg p-5 text-zinc-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">
            Panduan Mengambil Link Dokumen OPAC
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-zinc-300">
          <div className="p-3 bg-[#0d0f11] border border-zinc-800 rounded">
            <span className="font-semibold text-emerald-400 block mb-1">
              1. Pastikan Terhubung ke Wi-Fi Kampus UPN
            </span>
            <p className="text-zinc-400">
              IP <code className="text-zinc-300">192.168.36.203</code> hanya aktif di jaringan internal kampus (UPN-Free, UPN-Hotspot, atau Eduroam).
            </p>
          </div>

          <div className="p-3 bg-[#0d0f11] border border-zinc-800 rounded">
            <span className="font-semibold text-emerald-400 block mb-1">
              2. Buka Halaman Skripsi &amp; Klik &quot;Open File&quot;
            </span>
            <p className="text-zinc-400">
              Buka katalog repositori, pilih skripsi yang ingin dibaca, dan klik tombol <strong>&quot;Open File&quot;</strong>.
            </p>
          </div>

          <div className="p-3 bg-[#0d0f11] border border-zinc-800 rounded">
            <span className="font-semibold text-emerald-400 block mb-1">
              3. Salin URL di Address Bar
            </span>
            <p className="text-zinc-400 mb-2">
              Salin tautan lengkap yang muncul di address bar peramban Anda.
            </p>
            <div className="p-2 bg-black/50 border border-zinc-800 rounded flex items-center justify-between gap-2">
              <code className="text-[11px] font-mono text-zinc-400 truncate">
                {sampleUrl}
              </code>
              <button
                onClick={handleCopy}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] flex items-center gap-1 flex-shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Tersalin" : "Salin"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={() => {
              onUseSampleUrl("demo");
              onClose();
            }}
            className="text-xs text-emerald-400 hover:underline"
          >
            Coba Mode Demo sekarang &rarr;
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
