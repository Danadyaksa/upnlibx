import React from "react";
import { Terminal, Network, Puzzle } from "lucide-react";

export default function TechnicalPanel() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="border border-zinc-800 bg-[#101316] rounded-lg divide-y divide-zinc-800 text-xs">
        {/* Section 1: Cara Pasang Ekstensi */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-2">
            <Puzzle className="w-4 h-4 text-emerald-400" />
            <span>Cara Pasang Ekstensi Browser UpnLibX (Chrome, Edge, Brave &amp; Firefox)</span>
          </div>
          <div className="space-y-2.5 text-zinc-400 leading-relaxed">
            <div>
              <strong className="text-zinc-200">Google Chrome / Microsoft Edge / Brave:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>
                  Unduh dan ekstrak file <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">upnlibx-extension.zip</code> ke sebuah folder (atau gunakan folder <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">extension/</code> di repositori proyek).
                </li>
                <li>
                  Buka alamat <code className="text-emerald-400 bg-zinc-900 px-1 py-0.5 rounded">chrome://extensions</code> (atau <code className="text-emerald-400 bg-zinc-900 px-1 py-0.5 rounded">edge://extensions</code>).
                </li>
                <li>
                  Aktifkan sakelar <strong>Developer mode (Mode Pengembang)</strong> di pojok kanan atas.
                </li>
                <li>
                  Klik tombol <strong>Load unpacked (Muat yang belum dikemas)</strong>, lalu pilih folder ekstensi tersebut.
                </li>
              </ol>
            </div>
            <div>
              <strong className="text-zinc-200">Mozilla Firefox / Zen Browser:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>
                  Buka alamat <code className="text-emerald-400 bg-zinc-900 px-1 py-0.5 rounded">about:debugging#/runtime/this-firefox</code> di tab baru.
                </li>
                <li>
                  Klik tombol <strong>Load Temporary Add-on...</strong> lalu pilih file <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">upnlibx-extension.zip</code> (atau file <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">manifest.json</code> di dalam folder <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">extension/</code>).
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Section 2: Cara Ambil URL */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Cara Menggunakan di Wi-Fi UPN</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 leading-relaxed">
            <li>
              Hubungkan laptop ke Wi-Fi kampus UPN (
              <span className="text-zinc-300">UPN-Free</span>, <span className="text-zinc-300">UPN-Hotspot</span>, atau <span className="text-zinc-300">Eduroam</span>).
            </li>
            <li>
              Buka halaman dokumen skripsi di OPAC:{" "}
              <code className="text-zinc-300 font-mono text-[11px] bg-zinc-900 px-1 py-0.5 rounded">
                http://192.168.36.203/libsys_digit_upnvyk/opac/
              </code>{" "}
              lalu klik <strong>&quot;Open File&quot;</strong>.
            </li>
            <li>
              Jika memakai <strong>Ekstensi</strong>: Tombol hijau <strong>&quot;Unduh PDF Lengkap&quot;</strong> otomatis muncul di pojok kanan bawah halaman OPAC!
            </li>
            <li>
              Jika memakai <strong>Web ini tanpa ekstensi</strong>: Tekan <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">Ctrl+U</code> pada halaman dokumen OPAC, salin semua HTML, dan tempelkan di tab <strong>Tempel HTML</strong> di atas.
            </li>
          </ol>
        </div>

        {/* Section 3: Catatan Teknis */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-2">
            <Network className="w-4 h-4 text-emerald-400" />
            <span>Mengapa Ekstensi / Mode HTML Bebas Error Jaringan?</span>
          </div>
          <div className="space-y-2 text-zinc-400 leading-relaxed">
            <p>
              Alamat <code className="text-zinc-300 font-mono text-[11px] bg-zinc-900 px-1 py-0.5 rounded">192.168.36.203</code> adalah IP lokal intranet kampus. Server hosting cloud (seperti Vercel) berada di luar jaringan kampus sehingga tidak dapat mem-fetch IP tersebut secara langsung. Dengan <strong>Ekstensi Browser</strong> atau mode <strong>Tempel HTML</strong>, seluruh proses ekstraksi dan pembuatan PDF A4 (<code className="text-zinc-300 font-mono text-[11px]">pdf-lib</code>) dieksekusi 100% langsung di dalam browser laptop Anda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
