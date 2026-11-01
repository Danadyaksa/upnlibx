import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { generateDemoUpnDocument } from "@/lib/demo-generator";

export const maxDuration = 60; // Timeout 60s untuk dokumen tebal

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL tidak valid atau kosong." },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // Check if this is a demo/simulation request
    if (
      trimmedUrl.toLowerCase() === "demo" ||
      trimmedUrl.includes("demo-sample") ||
      trimmedUrl.includes("upnlibx-demo")
    ) {
      // Simulate slight processing time for realistic UI transitions
      await new Promise((res) => setTimeout(res, 800));

      const filename = "Contoh_Skripsi_UPN_Veteran_Yogyakarta_Demo.pdf";
      const demoPdfBytes = await generateDemoUpnDocument();

      return new Response(Buffer.from(demoPdfBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "X-Total-Pages": "3",
          "X-Raw-Pages": "6",
          "X-Document-Title": encodeURIComponent(filename),
          "X-Is-Demo": "true",
        },
      });
    }

    // 1. Fetch HTML dari server UPN dengan timeout 30 detik
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    let response: Response;
    try {
      response = await fetch(trimmedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 UpnLibX/1.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        },
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json(
          {
            error:
              "Koneksi ke server perpustakaan UPN (192.168.36.203) timeout setelah 35 detik. Pastikan perangkat Anda terhubung ke Wi-Fi / Intranet UPN.",
            code: "TIMEOUT",
          },
          { status: 504 }
        );
      }
      return NextResponse.json(
        {
          error:
            "Gagal menghubungi server UPN (192.168.36.203). Alamat IP intranet ini hanya dapat diakses saat terhubung ke Wi-Fi kampus UPN (UPN-Free / UPN-Hotspot / Eduroam). Jika ingin menguji tampilan, gunakan tombol 'Mode Demo'.",
          details: fetchErr.message,
          code: "NETWORK_UNREACHABLE",
        },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Gagal mengakses server UPN (HTTP ${response.status}). Pastikan terhubung ke Wi-Fi UPN dan dokumen belum kadaluarsa!`,
          code: "SERVER_ERROR",
        },
        { status: 502 }
      );
    }

    const htmlText = await response.text();

    // 2. Ekstrak nama file dari <title> atau query params
    let filename = "Dokumen-UPN.pdf";
    const titleMatch = htmlText.match(/<title>Open File - (.*?)<\/title>/i) ||
                       htmlText.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const cleanName = titleMatch[1]
        .replace(/^Open File\s*-\s*/i, "")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();
      if (cleanName) {
        filename = cleanName.toLowerCase().endsWith(".pdf")
          ? cleanName
          : `${cleanName}.pdf`;
      }
    } else {
      // Fallback: check URL file parameter
      try {
        const parsedUrl = new URL(trimmedUrl);
        const fileParam = parsedUrl.searchParams.get("file");
        if (fileParam) {
          const cleanFile = fileParam.replace(/[\\/:*?"<>|]/g, "").trim();
          filename = cleanFile.toLowerCase().endsWith(".pdf")
            ? cleanFile
            : `${cleanFile}.pdf`;
        }
      } catch {
        // use default filename
      }
    }

    // 3. Ekstrak data base64 gambar
    // Format: <img src="data:image/jpg;base64,..." /> atau jpeg/png
    const imgRegex = /<img[^>]+src=['"]data:image\/[^;]+;base64,([^'"]+)['"]/gi;
    const rawMatches: string[] = [];
    let match;
    while ((match = imgRegex.exec(htmlText)) !== null) {
      if (match[1] && match[1].length > 100) {
        rawMatches.push(match[1]);
      }
    }

    if (rawMatches.length === 0) {
      return NextResponse.json(
        {
          error:
            "Tidak ditemukan gambar dokumen pada halaman ini. Pastikan Anda menyalin link 'Open File' yang langsung menampilkan lembar dokumen, dan token sesi masih aktif.",
          code: "NO_IMAGES_FOUND",
        },
        { status: 404 }
      );
    }

    // 4. Deduplikasi berurutan (karena server UPN me-render 2x per halaman secara berturut-turut)
    const uniquePages: string[] = [];
    for (let i = 0; i < rawMatches.length; i++) {
      if (i === 0 || rawMatches[i] !== rawMatches[i - 1]) {
        uniquePages.push(rawMatches[i]);
      }
    }

    // 5. Bangun dokumen PDF (A4 standar: 595.28 x 841.89 pt)
    const pdfDoc = await PDFDocument.create();
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;

    for (let idx = 0; idx < uniquePages.length; idx++) {
      const imgBytes = Buffer.from(uniquePages[idx], "base64");
      let embeddedImage;
      try {
        embeddedImage = await pdfDoc.embedJpg(imgBytes);
      } catch {
        try {
          embeddedImage = await pdfDoc.embedPng(imgBytes);
        } catch (embedErr) {
          console.warn(`Gagal embed halaman ke-${idx + 1}:`, embedErr);
          continue; // Lewati halaman jika corrupt
        }
      }

      const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      const { width: imgW, height: imgH } = embeddedImage;

      // Hitung skala proporsional agar fit di halaman A4 tanpa gepeng
      const scale = Math.min(A4_WIDTH / imgW, A4_HEIGHT / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      // Posisikan di tengah (centered)
      page.drawImage(embeddedImage, {
        x: (A4_WIDTH - drawW) / 2,
        y: (A4_HEIGHT - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    }

    if (pdfDoc.getPageCount() === 0) {
      return NextResponse.json(
        {
          error: "Gagal menyusun lembar PDF karena format gambar tidak didukung.",
          code: "EMBED_FAILED",
        },
        { status: 500 }
      );
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "X-Total-Pages": uniquePages.length.toString(),
        "X-Raw-Pages": rawMatches.length.toString(),
        "X-Document-Title": encodeURIComponent(filename),
      },
    });
  } catch (error: any) {
    console.error("Internal extract error:", error);
    return NextResponse.json(
      {
        error: error.message || "Terjadi kesalahan internal saat menyusun PDF.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
