"use client";

import React from "react";
import { History, FileText, Trash2, ArrowUpRight } from "lucide-react";

export interface HistoryItem {
  filename: string;
  totalPages: number;
  timestamp: number;
  url: string;
}

interface RecentHistoryProps {
  items: HistoryItem[];
  onSelectUrl: (url: string) => void;
  onClearHistory: () => void;
}

export default function RecentHistory({
  items,
  onSelectUrl,
  onClearHistory,
}: RecentHistoryProps) {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 px-4">
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold uppercase tracking-wider font-mono">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Riwayat Ekstraksi Sesi Ini</span>
          </div>

          <button
            onClick={onClearHistory}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            title="Bersihkan riwayat"
          >
            <Trash2 className="w-3 h-3" />
            <span>Hapus Riwayat</span>
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={`${item.timestamp}-${idx}`}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/60 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white truncate">
                    {item.filename}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                    <span>{item.totalPages} Halaman</span>
                    <span>•</span>
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectUrl(item.url)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 group-hover:text-emerald-300 bg-zinc-800/60 group-hover:bg-emerald-500/10 border border-zinc-700/40 group-hover:border-emerald-500/30 transition-all flex items-center gap-1 flex-shrink-0"
              >
                <span>Pakai Link</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
