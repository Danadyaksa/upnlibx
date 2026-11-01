"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Wifi, WifiOff, RefreshCw, HelpCircle, ShieldCheck } from "lucide-react";

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
    // Auto-recheck every 60 seconds
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-900/30 bg-[#090d0e]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center">
                Upn<span className="text-emerald-400 font-extrabold">LibX</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
              UPNVYK Digital Library Extractor
            </p>
          </div>
        </div>

        {/* Status Pill & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Intranet Status Indicator */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              intranetStatus === "connected"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : intranetStatus === "unreachable"
                ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400"
            }`}
            title="Status jangkauan server intranet OPAC (192.168.36.203)"
          >
            {intranetStatus === "connected" ? (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Intranet Terhubung</span>
              </>
            ) : intranetStatus === "unreachable" ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Luar Jaringan Kampus</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                <span>Memeriksa Jaringan...</span>
              </>
            )}

            <button
              onClick={checkStatus}
              disabled={isRefreshing}
              className="ml-1 text-zinc-400 hover:text-white transition-transform active:rotate-180"
              title="Periksa ulang koneksi intranet"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Quick Demo Button */}
          <button
            onClick={onUseDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mode Demo</span>
          </button>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panduan Link</span>
            <span className="sm:hidden">Panduan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
