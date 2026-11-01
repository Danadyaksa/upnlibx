import React from "react";
import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-900 bg-[#070a0b] py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1">
              Upn<span className="text-emerald-400">LibX</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              UPN &quot;Veteran&quot; Yogyakarta Fulltext Extractor &amp; PDF Engine
            </p>
          </div>
        </div>

        <div className="text-xs text-zinc-400 max-w-md text-center sm:text-right leading-relaxed">
          <p>
            Dibuat untuk mempermudah studi literatur civitas akademika UPNVYK.
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            Gunakan selalu untuk kepentingan akademik dan junjung tinggi etika pengutipan karya ilmiah.
          </p>
        </div>
      </div>
    </footer>
  );
}
