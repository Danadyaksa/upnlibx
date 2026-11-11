(function () {
  if (window.__upnlibxInjected) return;
  window.__upnlibxInjected = true;

  const runtime = typeof browser !== "undefined" ? browser.runtime : chrome.runtime;

  function extractDocumentDataFromDOM() {
    // 1. Extract filename from <title> or URL query param "file"
    let filename = "Dokumen-UPN.pdf";
    const rawTitle = document.title || "";
    const cleanedTitle = rawTitle
      .replace(/^Open File\s*-\s*/i, "")
      .replace(/[\\/:*?"<>|]/g, "")
      .trim();

    if (cleanedTitle && cleanedTitle.toLowerCase() !== "open file") {
      filename = cleanedTitle.toLowerCase().endsWith(".pdf")
        ? cleanedTitle
        : `${cleanedTitle}.pdf`;
    } else {
      try {
        const urlObj = new URL(window.location.href);
        const fileParam = urlObj.searchParams.get("file");
        if (fileParam) {
          const cleanParam = fileParam.replace(/[\\/:*?"<>|]/g, "").trim();
          filename = cleanParam.toLowerCase().endsWith(".pdf")
            ? cleanParam
            : `${cleanParam}.pdf`;
        }
      } catch (e) {
        // fallback to default
      }
    }

    // 2. Collect all base64 images from DOM
    const imgElements = Array.from(document.querySelectorAll("img"));
    const rawPages = [];

    for (const img of imgElements) {
      const src = img.getAttribute("src") || "";
      const match = src.match(/^data:image\/([^;]+);base64,(.+)$/i);
      if (match && match[2] && match[2].length > 100) {
        rawPages.push({
          mime: match[1].toLowerCase(),
          base64: match[2].trim(),
        });
      }
    }

    // 3. Sequential deduplication (UPN server renders each page 2x consecutively)
    const uniquePages = [];
    for (let i = 0; i < rawPages.length; i++) {
      if (i === 0 || rawPages[i].base64 !== rawPages[i - 1].base64) {
        uniquePages.push(rawPages[i]);
      }
    }

    return {
      filename,
      rawCount: rawPages.length,
      uniqueCount: uniquePages.length,
      uniquePages,
    };
  }

  function base64ToUint8Array(base64) {
    const cleanBase64 = base64.replace(/[\r\n\s]+/g, "");
    const binaryString = window.atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function buildAndDownloadPdf(onProgress) {
    if (typeof PDFLib === "undefined") {
      throw new Error("Engine PDF (pdf-lib) belum dimuat.");
    }

    const { filename, uniquePages, rawCount } = extractDocumentDataFromDOM();
    if (uniquePages.length === 0) {
      throw new Error("Tidak ditemukan gambar dokumen Base64 pada halaman ini.");
    }

    const pdfDoc = await PDFLib.PDFDocument.create();
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;

    for (let idx = 0; idx < uniquePages.length; idx++) {
      if (onProgress) {
        onProgress(idx + 1, uniquePages.length);
      }

      // Yield briefly to keep UI responsive
      if (idx % 5 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }

      const item = uniquePages[idx];
      let imgBytes;
      try {
        imgBytes = base64ToUint8Array(item.base64);
      } catch (e) {
        continue;
      }

      let embeddedImage;
      try {
        embeddedImage = await pdfDoc.embedJpg(imgBytes);
      } catch {
        try {
          embeddedImage = await pdfDoc.embedPng(imgBytes);
        } catch {
          continue;
        }
      }

      const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      const { width: imgW, height: imgH } = embeddedImage;
      const scale = Math.min(A4_WIDTH / imgW, A4_HEIGHT / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      page.drawImage(embeddedImage, {
        x: (A4_WIDTH - drawW) / 2,
        y: (A4_HEIGHT - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);

    return {
      filename,
      uniqueCount: uniquePages.length,
      rawCount,
      fileSize: blob.size,
    };
  }

  // Listen to messages from extension popup
  if (runtime && runtime.onMessage) {
    runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message && message.action === "GET_PAGE_STATUS") {
        const info = extractDocumentDataFromDOM();
        sendResponse({
          ok: true,
          isDocumentPage: info.uniqueCount > 0,
          filename: info.filename,
          rawCount: info.rawCount,
          uniqueCount: info.uniqueCount,
          url: window.location.href,
        });
        return true;
      }

      if (message && message.action === "EXTRACT_FROM_TAB") {
        buildAndDownloadPdf()
          .then((res) => sendResponse({ ok: true, result: res }))
          .catch((err) =>
            sendResponse({ ok: false, error: err.message || "Gagal menyusun PDF." })
          );
        return true; // async response
      }
    });
  }

  // Inject Floating Action Widget on OPAC document pages
  function injectFloatingWidget() {
    const info = extractDocumentDataFromDOM();
    if (info.uniqueCount === 0) return;
    if (document.getElementById("upnlibx-floating-bar")) return;

    const container = document.createElement("div");
    container.id = "upnlibx-floating-bar";
    container.style.cssText = [
      "position: fixed",
      "bottom: 20px",
      "right: 20px",
      "z-index: 2147483647",
      "background: #121518",
      "color: #f0f3f6",
      "border: 1px solid #272d34",
      "border-radius: 8px",
      "padding: 12px 14px",
      "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "box-shadow: 0 10px 25px rgba(0,0,0,0.6)",
      "width: 290px",
      "box-sizing: border-box",
    ].join(";");

    const duplicatesRemoved = Math.max(0, info.rawCount - info.uniqueCount);

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;"></span>
          <strong style="font-size:12px;letter-spacing:-0.01em;color:#ffffff;">Upn<span style="color:#10b981;">LibX</span> Extractor</strong>
        </div>
        <button id="upnlibx-close-btn" title="Tutup" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:14px;line-height:1;padding:2px 4px;">&times;</button>
      </div>
      <div style="font-size:11px;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;font-family:monospace;">
        ${info.filename}
      </div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:10px;">
        <strong style="color:#f0f3f6;">${info.uniqueCount}</strong> halaman unik &bull; <span style="color:#10b981;">${duplicatesRemoved} duplikat dihapus</span>
      </div>
      <button id="upnlibx-download-btn" style="width:100%;background:#059669;color:#ffffff;border:none;border-radius:5px;padding:8px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.15s;">
        Unduh PDF Lengkap (${info.uniqueCount} Hlm)
      </button>
      <div id="upnlibx-progress-wrap" style="display:none;margin-top:8px;">
        <div id="upnlibx-progress-text" style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-family:monospace;">Menyusun PDF...</div>
        <div style="width:100%;height:4px;background:#1e242b;border-radius:2px;overflow:hidden;">
          <div id="upnlibx-progress-bar" style="width:0%;height:100%;background:#10b981;transition:width 0.1s;"></div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const closeBtn = document.getElementById("upnlibx-close-btn");
    const downloadBtn = document.getElementById("upnlibx-download-btn");
    const progressWrap = document.getElementById("upnlibx-progress-wrap");
    const progressText = document.getElementById("upnlibx-progress-text");
    const progressBar = document.getElementById("upnlibx-progress-bar");

    closeBtn.addEventListener("click", () => {
      container.remove();
    });

    downloadBtn.addEventListener("click", async () => {
      downloadBtn.disabled = true;
      downloadBtn.style.opacity = "0.6";
      downloadBtn.style.cursor = "wait";
      downloadBtn.textContent = "Memproses PDF...";
      progressWrap.style.display = "block";

      try {
        await buildAndDownloadPdf((current, total) => {
          const pct = Math.round((current / total) * 100);
          progressText.textContent = `Merangkai halaman ${current} dari ${total} (${pct}%)...`;
          progressBar.style.width = `${pct}%`;
        });
        downloadBtn.textContent = "Berhasil Diunduh!";
        downloadBtn.style.background = "#10b981";
        progressText.textContent = "Selesai! File PDF telah diunduh.";
        setTimeout(() => {
          downloadBtn.disabled = false;
          downloadBtn.style.opacity = "1";
          downloadBtn.style.cursor = "pointer";
          downloadBtn.style.background = "#059669";
          downloadBtn.textContent = `Unduh Ulang PDF (${info.uniqueCount} Hlm)`;
        }, 2500);
      } catch (err) {
        downloadBtn.disabled = false;
        downloadBtn.style.opacity = "1";
        downloadBtn.style.cursor = "pointer";
        downloadBtn.textContent = "Coba Lagi";
        progressText.style.color = "#f87171";
        progressText.textContent = err.message || "Gagal membuat PDF.";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectFloatingWidget);
  } else {
    injectFloatingWidget();
  }
})();
