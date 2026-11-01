import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800/80 py-6 px-4 text-center text-xs text-zinc-500">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image
            src="/logo-mark.png"
            alt="UpnLibX"
            width={18}
            height={18}
            className="h-4 w-auto object-contain opacity-70"
          />
          <span>UpnLibX &bull; UPN &quot;Veteran&quot; Yogyakarta OPAC Tool</span>
        </div>
        <p className="text-[11px] text-zinc-600">
          Khusus untuk referensi studi &amp; penelitian civitas akademika.
        </p>
      </div>
    </footer>
  );
}
