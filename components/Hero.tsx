import React from "react";
import { Sparkles, FileCheck, Layers, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 text-center max-w-4xl mx-auto px-4">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>UPN &quot;Veteran&quot; Yogyakarta • Digital Repository Solution</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
        Ekstrak Skripsi Digital UPN{" "}
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
          Jadi Satu PDF Utuh
        </span>
      </h1>

      {/* Subhead */}
      <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
        Solusi cerdas bagi mahasiswa &amp; civitas akademika UPNVYK. Ubah pecahan lembar dokumen
        berformat Base64 yang terkunci di OPAC menjadi berkas PDF standar A4 berkualitas tinggi dalam sekejap.
      </p>

      {/* Value Badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-zinc-400 font-medium">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Deduplikasi Otomatis 2x Server</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800">
          <FileCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Canvas A4 Standar Presisi</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800">
          <Layers className="w-3.5 h-3.5 text-green-400" />
          <span>Ekstraksi Memori Langsung</span>
        </div>
      </div>
    </section>
  );
}
