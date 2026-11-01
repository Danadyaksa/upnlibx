import React from "react";

export default function Hero() {
  return (
    <section className="pt-8 pb-4 text-center max-w-3xl mx-auto px-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
        Ekstrak Dokumen OPAC UPN ke PDF
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Mengonversi pecahan gambar Base64 dari server perpustakaan UPN (
        <code className="text-zinc-300 font-mono text-[12px] bg-zinc-800 px-1 py-0.5 rounded">
          192.168.36.203
        </code>
        ) menjadi satu berkas PDF A4. Bug duplikasi server otomatis dibersihkan.
      </p>
    </section>
  );
}
