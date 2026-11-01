import React from "react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800/80 py-6 px-4 text-center text-xs text-zinc-500">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          UpnLibX &bull; UPN &quot;Veteran&quot; Yogyakarta OPAC Tool
        </p>
        <p className="text-[11px] text-zinc-600">
          Khusus untuk referensi studi &amp; penelitian civitas akademika.
        </p>
      </div>
    </footer>
  );
}
