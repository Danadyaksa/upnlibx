"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { RefreshCw, HelpCircle } from "lucide-react";

interface NavbarProps {
  onOpenGuide: () => void;
  onUseDemo: () => void;
}

export default function Navbar({ onOpenGuide, onUseDemo }: NavbarProps) {
  const [intranetStatus, setIntranetStatus] = useState<"checking" | "connected" | "unreachable">("checking");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/intranet-status");
      const data = await res.json();
      setIntranetStatus(data.connected ? "connected" : "unreachable");
    } catch {
      setIntranetStatus("unreachable");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-zinc-800 bg-[#0e1113]">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand: Logo Icon + Logo Text */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Image
            src="/logo-mark.png"
            alt="UpnLibX Logo"
            width={32}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
          <Image
            src="/logo-text.png"
            alt="UpnLibX"
            width={110}
            height={24}
            className="h-4 sm:h-4.5 w-auto object-contain"
            priority
          />
          <span className="text-[11px] text-zinc-500 font-mono hidden md:inline ml-1 border-l border-zinc-800 pl-2">
            OPAC Extractor
          </span>
        </div>

        {/* Intranet Status & Navigation */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Intranet connectivity badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono"
            style={{
              backgroundColor: intranetStatus === "connected" ? "#062b1a" : "#24180d",
              borderColor: intranetStatus === "connected" ? "#166534" : "#78350f",
              color: intranetStatus === "connected" ? "#4ade80" : "#fbbf24",
            }}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                intranetStatus === "connected"
                  ? "bg-emerald-400"
                  : intranetStatus === "unreachable"
                  ? "bg-amber-400"
                  : "bg-zinc-500 animate-pulse"
              }`}
            />
            <span className="text-[11px]">
              {intranetStatus === "connected"
                ? "Wi-Fi UPN: Terhubung"
                : intranetStatus === "unreachable"
                ? "Di Luar Kampus"
                : "Memeriksa..."}
            </span>
            <button
              onClick={checkStatus}
              disabled={isRefreshing}
              className="text-zinc-400 hover:text-zinc-200 ml-0.5"
              title="Cek ulang koneksi intranet"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Quick Demo */}
          <button
            onClick={onUseDemo}
            className="px-2.5 py-1 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
          >
            Coba Demo
          </button>

          {/* Guide */}
          <button
            onClick={onOpenGuide}
            className="px-2.5 py-1 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
