"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Mengapa tautan harus diakses dari jaringan Wi-Fi UPN?",
      a: "Alamat IP 192.168.36.203 merupakan alamat IP privat intranet (RFC 1918) milik UPN 'Veteran' Yogyakarta. Server katalog repositori digital ini tidak terhubung langsung ke internet publik, sehingga hanya bisa dijangkau saat perangkat Anda terhubung ke jaringan Wi-Fi UPN-Free, UPN-Hotspot, Eduroam, atau LAN perpustakaan.",
    },
    {
      q: "Bagaimana jika saya ingin mencoba aplikasi saat berada di luar kampus?",
      a: "Anda dapat menekan tombol 'Mode Demo' atau mengetik 'demo' pada kolom input. UpnLibX akan mensimulasikan seluruh tahapan pipeline—mulai dari parsing dokumen, deduplikasi, hingga penyusunan berkas PDF A4 dan pratinjau interaktif.",
    },
    {
      q: "Mengapa lembar PDF di OPAC aslinya tampak berulang / dobel?",
      a: "Ini adalah bug rendering pada sistem server perpustakaan UPN yang mencetak setiap tag <img> sebanyak 2 kali berturut-turut. UpnLibX secara otomatis menjalankan algoritma deduplikasi berurutan (sequential deduplication) sehingga hanya halaman unik yang dimasukkan ke dalam file PDF akhir.",
    },
    {
      q: "Apakah berkas skripsi yang saya unduh disimpan di server lain?",
      a: "Sama sekali tidak. UpnLibX memproses berkas secara in-memory streaming di server lokal/runtime tanpa pernah menyimpan data dokumen ke database permanen. Berkas Anda langsung dikirim ke browser Anda secara privat.",
    },
  ];

  return (
    <section className="w-full max-w-3xl mx-auto mt-20 px-4">
      <div className="text-center mb-8">
        <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          Pertanyaan Umum (FAQ)
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
          Seputar Repositori &amp; Ekstraksi UpnLibX
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-950/70 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-900/50 transition-colors"
              >
                <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-emerald-400" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 pt-3 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
