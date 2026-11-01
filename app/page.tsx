"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ExtractorCard from "@/components/ExtractorCard";
import RecentHistory, { HistoryItem } from "@/components/RecentHistory";
import TechnicalPanel from "@/components/TechnicalPanel";
import Footer from "@/components/Footer";
import GuideModal from "@/components/GuideModal";
import PdfPreviewModal from "@/components/PdfPreviewModal";

const STORAGE_KEY = "upnlibx_recent_history";

export default function Home() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedExternalUrl, setSelectedExternalUrl] = useState<string | undefined>(undefined);

  // PDF Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState("Dokumen-UPN.pdf");

  // History
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistoryItems(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const handleSaveHistory = (item: HistoryItem) => {
    setHistoryItems((prev) => {
      const filtered = prev.filter((i) => i.filename !== item.filename);
      const updated = [item, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleOpenPreview = (blobUrl: string, filename: string) => {
    setPreviewBlobUrl(blobUrl);
    setPreviewFilename(filename);
    setPreviewOpen(true);
  };

  const handleDownloadFromPreview = () => {
    if (!previewBlobUrl) return;
    const a = document.createElement("a");
    a.href = previewBlobUrl;
    a.download = previewFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d0e] text-zinc-100">
      <Navbar
        onOpenGuide={() => setIsGuideOpen(true)}
        onUseDemo={() => setSelectedExternalUrl("demo")}
      />

      <main className="flex-1 pb-12">
        <Hero />

        <ExtractorCard
          onOpenPreview={handleOpenPreview}
          externalUrl={selectedExternalUrl}
          onClearExternalUrl={() => setSelectedExternalUrl(undefined)}
          onSaveHistory={handleSaveHistory}
        />

        <RecentHistory
          items={historyItems}
          onSelectUrl={(url) => setSelectedExternalUrl(url)}
          onClearHistory={handleClearHistory}
        />

        <TechnicalPanel />
      </main>

      <Footer />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onUseSampleUrl={(sample) => {
          setSelectedExternalUrl(sample);
          setIsGuideOpen(false);
        }}
      />

      <PdfPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfBlobUrl={previewBlobUrl}
        filename={previewFilename}
        onDownload={handleDownloadFromPreview}
      />
    </div>
  );
}
