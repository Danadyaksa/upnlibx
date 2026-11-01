import React from "react";
import { Terminal, Network, FileCode } from "lucide-react";

export default function TechnicalPanel() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="border border-zinc-800 bg-[#101316] rounded-lg divide-y divide-zinc-800 text-xs">
        {/* Section 1: Cara Ambil URL */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Cara Mendapatkan URL Dokumen dari OPAC</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 leading-relaxed">
            <li>
              Hubungkan laptop atau ponsel Anda ke Wi-Fi kampus UPN (
              <span className="text-zinc-300">UPN-Free</span>, <span className="text-zinc-300">UPN-Hotspot</span>, atau <span className="text-zinc-300">Eduroam</span>).
            </li>
            <li>
              Buka katalog repositori di browser:{" "}
              <code className="text-zinc-300 font-mono text-[11px] bg-zinc-900 px-1 py-0.5 rounded">
                http://192.168.36.203/libsys_digit_upnvyk/opac/
              </code>
            </li>
            <li>
              Cari skripsi/karya ilmiah yang diinginkan, kemudian klik tombol <strong>&quot;Open File&quot;</strong>.
            </li>
            <li>
              Salin URL lengkap dari kolom address bar browser, lalu tempelkan ke kolom input di atas.
            </li>
          </ol>
        </div>

        {/* Section 2: Catatan Teknis & Server Quirks */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-2">
            <Network className="w-4 h-4 text-emerald-400" />
            <span>Catatan Teknis Server Perpustakaan UPN</span>
          </div>
          <div className="space-y-2 text-zinc-400 leading-relaxed">
            <p>
              <strong className="text-zinc-300">Jaringan Intranet:</strong> Alamat IP{" "}
              <code className="text-zinc-300 font-mono text-[11px] bg-zinc-900 px-1 py-0.5 rounded">
                192.168.36.203
              </code>{" "}
              adalah subnet internal kampus. Dokumen tidak bisa diakses dari jaringan internet biasa (paket data seluler / Wi-Fi luar kampus) tanpa jaringan kampus.
            </p>
            <p>
              <strong className="text-zinc-300">Bug Render Duplikat:</strong> Server UPN mencetak setiap lembar dokumen sebanyak 2 kali berturut-turut di dalam DOM HTML. Sistem UpnLibX menjalankan deduplikasi sekuensial (
              <code className="text-zinc-300 font-mono text-[11px] bg-zinc-900 px-1 py-0.5 rounded">
                img[i] !== img[i-1]
              </code>
              ) agar lembar PDF akhir tidak memiliki halaman dobel.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

