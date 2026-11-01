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
    <div className="w-full max-w-2xl mx-auto mt-6 px-4">
      <div className="border border-zinc-800 bg-[#101316] rounded-lg p-3.5">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs">
          <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-zinc-400" />
            Riwayat Unduhan Sesi Ini
          </span>
          <button
            onClick={onClearHistory}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Hapus</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div
              key={`${item.timestamp}-${idx}`}
              className="flex items-center justify-between p-2 rounded hover:bg-zinc-800/60 text-xs transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FileText className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span className="text-zinc-300 truncate font-mono text-[11px]">
                  {item.filename}
                </span>
                <span className="text-zinc-500 text-[11px]">
                  ({item.totalPages} hlm)
                </span>
              </div>

              <button
                onClick={() => onSelectUrl(item.url)}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 flex-shrink-0"
              >
                <span>Pakai</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
