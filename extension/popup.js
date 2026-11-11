(function () {
  const ext = typeof browser !== "undefined" ? browser : chrome;

  const networkBadge = document.getElementById("network-badge");
  const networkText = document.getElementById("network-text");

  const activeTabCard = document.getElementById("active-tab-card");
  const activeDocTitle = document.getElementById("active-doc-title");
  const activeDocMeta = document.getElementById("active-doc-meta");
  const btnExtractTab = document.getElementById("btn-extract-tab");

  const urlInput = document.getElementById("url-input");
  const btnPaste = document.getElementById("btn-paste");
  const btnExtractUrl = document.getElementById("btn-extract-url");

  const progressBox = document.getElementById("progress-box");
  const progressLabel = document.getElementById("progress-label");
  const progressFill = document.getElementById("progress-fill");
  const messageBox = document.getElementById("message-box");

  let activeTabId = null;

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
  }

  function hideMessage() {
    messageBox.className = "message-box";
    messageBox.textContent = "";
  }

  function updateProgress(text, percent) {
    progressBox.style.display = "block";
    progressLabel.textContent = text;
    progressFill.style.width = `${percent}%`;
  }

  // 1. Check UPN Intranet directly from user's browser
  async function checkIntranetConnection() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch("http://192.168.36.203/libsys_digit_upnvyk/opac/", {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);
      if (res.ok || res.status < 500) {
        networkBadge.className = "status-badge connected";
        networkText.textContent = "Wi-Fi UPN: Terhubung";
        return;
      }
    } catch (e) {
      clearTimeout(timer);
    }
    networkBadge.className = "status-badge offline";
    networkText.textContent = "Luar Wi-Fi UPN";
  }

  // 2. Check if active tab already has OPAC document open
  async function checkActiveTab() {
    try {
      const tabs = await ext.tabs.query({ active: true, currentWindow: true });
      if (!tabs || !tabs[0]) return;
      const tab = tabs[0];
      activeTabId = tab.id;

      if (tab.url && tab.url.includes("192.168.36.203")) {
        networkBadge.className = "status-badge connected";
        networkText.textContent = "Wi-Fi UPN: Terhubung";
        urlInput.value = tab.url;
      }

      // Send message to content script
      ext.tabs.sendMessage(tab.id, { action: "GET_PAGE_STATUS" }, (response) => {
        if (ext.runtime.lastError || !response || !response.ok) {
          return;
        }
        if (response.isDocumentPage) {
          activeTabCard.style.display = "block";
          activeDocTitle.textContent = response.filename;
          const dup = Math.max(0, response.rawCount - response.uniqueCount);
          activeDocMeta.textContent = `${response.uniqueCount} halaman unik • ${dup} duplikat dihapus`;
          btnExtractTab.textContent = `Unduh PDF (${response.uniqueCount} Halaman)`;
        }
      });
    } catch (err) {
      // ignore if restricted tab like chrome://
    }
  }

  // Helper: Base64 to Uint8Array
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

  // Helper: Parse HTML string and build PDF
  async function parseHtmlAndBuildPdf(htmlText, sourceUrl) {
    updateProgress("Membaca struktur halaman HTML...", 15);

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    // Extract filename
    let filename = "Dokumen-UPN.pdf";
    const rawTitle = doc.title || "";
    const cleanedTitle = rawTitle
      .replace(/^Open File\s*-\s*/i, "")
      .replace(/[\\/:*?"<>|]/g, "")
      .trim();

    if (cleanedTitle && cleanedTitle.toLowerCase() !== "open file") {
      filename = cleanedTitle.toLowerCase().endsWith(".pdf")
        ? cleanedTitle
        : `${cleanedTitle}.pdf`;
    } else if (sourceUrl) {
      try {
        const u = new URL(sourceUrl);
        const f = u.searchParams.get("file");
        if (f) {
          const cf = f.replace(/[\\/:*?"<>|]/g, "").trim();
          filename = cf.toLowerCase().endsWith(".pdf") ? cf : `${cf}.pdf`;
        }
      } catch (e) {}
    }

    // Extract base64 images
    const imgs = Array.from(doc.querySelectorAll("img"));
    const rawPages = [];
    for (const img of imgs) {
      const src = img.getAttribute("src") || "";
      const m = src.match(/^data:image\/([^;]+);base64,(.+)$/i);
      if (m && m[2] && m[2].length > 100) {
        rawPages.push(m[2].trim());
      }
    }

    if (rawPages.length === 0) {
      throw new Error(
        "Tidak ditemukan gambar dokumen pada link tersebut. Pastikan link 'Open File' valid dan sesi belum habis."
      );
    }

    // Deduplicate sequential identical images
    const uniquePages = [];
    for (let i = 0; i < rawPages.length; i++) {
      if (i === 0 || rawPages[i] !== rawPages[i - 1]) {
        uniquePages.push(rawPages[i]);
      }
    }

    updateProgress(
      `Ditemukan ${uniquePages.length} halaman unik. Menyusun PDF...`,
      30
    );

    const pdfDoc = await PDFLib.PDFDocument.create();
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;

    for (let idx = 0; idx < uniquePages.length; idx++) {
      const pct = 30 + Math.round(((idx + 1) / uniquePages.length) * 65);
      updateProgress(
        `Menyusun halaman ${idx + 1} dari ${uniquePages.length}...`,
        pct
      );

      if (idx % 4 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }

      let imgBytes;
      try {
        imgBytes = base64ToUint8Array(uniquePages[idx]);
      } catch {
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

    updateProgress("Menyimpan berkas PDF...", 98);
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

    updateProgress("Selesai!", 100);
    return {
      filename,
      uniqueCount: uniquePages.length,
      rawCount: rawPages.length,
    };
  }

  // Event: Extract from Active Tab
  btnExtractTab.addEventListener("click", () => {
    if (!activeTabId) return;
    hideMessage();
    btnExtractTab.disabled = true;
    btnExtractTab.textContent = "Menyusun PDF di Tab...";

    ext.tabs.sendMessage(activeTabId, { action: "EXTRACT_FROM_TAB" }, (res) => {
      btnExtractTab.disabled = false;
      if (ext.runtime.lastError || !res) {
        showMessage("Gagal mengekstrak dari tab. Coba gunakan tombol di bawah.", "error");
        btnExtractTab.textContent = "Unduh PDF dari Tab Ini";
        return;
      }
      if (res.ok) {
        btnExtractTab.textContent = "Berhasil Diunduh!";
        showMessage(
          `Berhasil mengunduh ${res.result.filename} (${res.result.uniqueCount} hlm).`,
          "success"
        );
      } else {
        btnExtractTab.textContent = "Unduh PDF dari Tab Ini";
        showMessage(res.error || "Gagal mengekstrak dokumen.", "error");
      }
    });
  });

  // Event: Paste URL
  btnPaste.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        urlInput.value = text.trim();
        hideMessage();
      }
    } catch {
      urlInput.focus();
    }
  });

  // Event: Extract via URL directly from browser
  btnExtractUrl.addEventListener("click", async () => {
    const rawUrl = urlInput.value.trim();
    hideMessage();

    if (!rawUrl) {
      showMessage("Masukkan tautan OPAC UPN terlebih dahulu.", "error");
      return;
    }

    let targetUrl = rawUrl;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "http://" + targetUrl;
    }

    btnExtractUrl.disabled = true;
    updateProgress("Menghubungi server OPAC UPN (192.168.36.203)...", 10);

    try {
      const res = await fetch(targetUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(
          `Server UPN merespon HTTP ${res.status}. Pastikan terhubung ke Wi-Fi kampus UPN.`
        );
      }

      const htmlText = await res.text();
      const result = await parseHtmlAndBuildPdf(htmlText, targetUrl);

      showMessage(
        `Berhasil! ${result.filename} (${result.uniqueCount} halaman unik) telah diunduh.`,
        "success"
      );
    } catch (err) {
      progressBox.style.display = "none";
      showMessage(
        err.message ||
          "Gagal menghubungi 192.168.36.203. Pastikan laptop Anda terhubung ke Wi-Fi kampus UPN.",
        "error"
      );
    } finally {
      btnExtractUrl.disabled = false;
    }
  });

  checkIntranetConnection();
  checkActiveTab();
})();
