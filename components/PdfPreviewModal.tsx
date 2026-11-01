"use client";

import React from "react";
import { X, Download, ExternalLink } from "lucide-react";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlobUrl: string | null;
  filename: string;
  onDownload: () => void;
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  pdfBlobUrl,
  filename,
  onDownload,
}: PdfPreviewModalProps) {
  if (!isOpen || !pdfBlobUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[85vh] bg-[#14171a] border border-zinc-700 rounded-lg flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-[#0d0f11]">
          <span className="text-xs font-medium text-zinc-200 truncate pr-4">
            {filename}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </button>
            <a
              href={pdfBlobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-zinc-400 hover:text-white"
              title="Buka di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-zinc-900">
          <iframe
            src={`${pdfBlobUrl}#toolbar=1`}
            className="w-full h-full border-0"
            title="Pratinjau PDF"
          />
        </div>
      </div>
    </div>
  );
}
