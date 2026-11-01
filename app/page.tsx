"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ExtractorCard from "@/components/ExtractorCard";
import RecentHistory, { HistoryItem } from "@/components/RecentHistory";
import Features from "@/components/Features";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import GuideModal from "@/components/GuideModal";
import PdfPreviewModal from "@/components/PdfPreviewModal";

const STORAGE_KEY = "upnlibx_recent_history";

export default function Home() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedExternalUrl, setSelectedExternalUrl] = useState<string | undefined>(undefined);

  // PDF Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState("Dokumen-UPN.pdf");

  // History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveHistory = (item: HistoryItem) => {
    setHistoryItems((prev) => {
      const filtered = prev.filter((i) => i.filename !== item.filename);
      const updated = [item, ...filtered].slice(0, 5); // Keep top 5
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
    <div className="relative min-h-screen flex flex-col bg-[#090d0e] text-zinc-100 selection:bg-emerald-500 selection:text-black">
      {/* Background patterns and glowing effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-20" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] radial-glow pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        onOpenGuide={() => setIsGuideOpen(true)}
        onUseDemo={() => setSelectedExternalUrl("demo")}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
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

        <Features />

        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onUseSampleUrl={(sample) => {
          setSelectedExternalUrl(sample);
          setIsGuideOpen(false);
        }}
      />

      {/* PDF In-browser Preview Modal */}
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
