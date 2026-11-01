import React from "react";
import { ShieldCheck, Cpu, Filter, Layers, Database, Lock } from "lucide-react";

export default function Features() {
  const cards = [
    {
      icon: Filter,
      title: "Pembersihan Bug Duplikasi 2x Server",
      desc: "Sistem OPAC UPN memiliki anomali server di mana setiap halaman di-render 2 kali berurutan. Algoritma UpnLibX otomatis mendeteksi dan mengeliminasi halaman kembar secara presisi.",
      badge: "Smart Deduplication",
    },
    {
      icon: Cpu,
      title: "Kompilasi Langsung di Memori (pdf-lib)",
      desc: "Setiap lembar gambar Base64 didekodekan dan disusun ke kanvas A4 berstandar ISO menggunakan engine pdf-lib, menjaga proporsi asli tanpa kompresi pecah.",
      badge: "In-Memory Engine",
    },
    {
      icon: Lock,
      title: "Bypass Kunci Tampilan Base64",
      desc: "Mengubah dokumen yang tadinya hanya bisa dipandang sepintas di browser menjadi file PDF portabel yang dapat Anda simpan secara offline untuk bahan skripsi.",
      badge: "Fulltext Reassembly",
    },
    {
      icon: Database,
      title: "Deteksi Judul & Metadata Otomatis",
      desc: "Nama file hasil unduhan langsung disesuaikan dengan judul asli skripsi dari tag title dokumen, sehingga koleksi referensi Anda tertata rapi.",
      badge: "Auto Metadata",
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto mt-20 px-4">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
          Arsitektur &amp; Keunggulan Teknis
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
          Dirancang Khusus untuk Sistem Repositori UPNVYK
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          Mengatasi seluruh quirks dan kelemahan arsitektur sistem digital library kampus tanpa ribet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-emerald-500/30 transition-all hover:bg-zinc-900/40 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  {card.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
