import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateDemoUpnDocument(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // --- PAGE 1: COVER ---
  const page1 = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  
  // Title
  const title1 = "RANCANG BANGUN SISTEM REPOSITORI DIGITAL CERDAS";
  const title2 = "MENGGUNAKAN TEKNOLOGI SECURE EXTRACTION DAN OCR";
  const title3 = "DI LINGKUNGAN UPN \"VETERAN\" YOGYAKARTA";
  
  page1.drawText("SKRIPSI / TUGAS AKHIR", {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize("SKRIPSI / TUGAS AKHIR", 16)) / 2,
    y: 740,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.4, 0.2), // UPN Emerald Green
  });

  page1.drawText(title1, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(title1, 13)) / 2,
    y: 670,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page1.drawText(title2, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(title2, 13)) / 2,
    y: 650,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page1.drawText(title3, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(title3, 13)) / 2,
    y: 630,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Emblems / Logo Placeholder
  page1.drawCircle({
    x: A4_WIDTH / 2,
    y: 470,
    size: 55,
    color: rgb(0.92, 0.96, 0.93),
    borderColor: rgb(0.1, 0.5, 0.25),
    borderWidth: 2,
  });
  const upnText = "UPNVYK";
  page1.drawText(upnText, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(upnText, 14)) / 2,
    y: 465,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.45, 0.2),
  });

  // Author & Institution Info
  const authorName = "AKSANAL ALIFIAN";
  const nim = "NIM : 123200001";
  page1.drawText("Disusun Oleh:", {
    x: (A4_WIDTH - fontRegular.widthOfTextAtSize("Disusun Oleh:", 11)) / 2,
    y: 340,
    size: 11,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });
  page1.drawText(authorName, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(authorName, 12)) / 2,
    y: 318,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page1.drawText(nim, {
    x: (A4_WIDTH - fontRegular.widthOfTextAtSize(nim, 11)) / 2,
    y: 298,
    size: 11,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  const dept = "PROGRAM STUDI INFORMATIKA";
  const fac = "FAKULTAS TEKNIK INDUSTRI";
  const univ = "UNIVERSITAS PEMBANGUNAN NASIONAL \"VETERAN\" YOGYAKARTA";
  const year = "2024";

  page1.drawText(dept, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(dept, 11)) / 2,
    y: 160,
    size: 11,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.15),
  });
  page1.drawText(fac, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(fac, 11)) / 2,
    y: 142,
    size: 11,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.15),
  });
  page1.drawText(univ, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(univ, 11)) / 2,
    y: 124,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.45, 0.2),
  });
  page1.drawText(year, {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize(year, 11)) / 2,
    y: 106,
    size: 11,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  // --- PAGE 2: LEMBAR PENGESAHAN ---
  const page2 = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  page2.drawText("HALAMAN PENGESAHAN", {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize("HALAMAN PENGESAHAN", 14)) / 2,
    y: 750,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page2.drawText("Telah dipertahankan di hadapan Tim Penguji Skripsi dan Dinyatakan Lulus", {
    x: (A4_WIDTH - fontRegular.widthOfTextAtSize("Telah dipertahankan di hadapan Tim Penguji Skripsi dan Dinyatakan Lulus", 10)) / 2,
    y: 710,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });
  page2.drawLine({
    start: { x: 70, y: 690 },
    end: { x: A4_WIDTH - 70, y: 690 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  page2.drawText("Dosen Pembimbing I : Dr. Ir. Sumaryono, M.T. (NIP. 197105151998031002)", {
    x: 80,
    y: 580,
    size: 10,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });
  page2.drawText("Dosen Pembimbing II : Hendra Wicaksono, S.T., M.Cs. (NIP. 198402122010121003)", {
    x: 80,
    y: 520,
    size: 10,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });
  page2.drawText("Mengetahui,", {
    x: 80,
    y: 420,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });
  page2.drawText("Ketua Jurusan Informatika", {
    x: 80,
    y: 400,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // --- PAGE 3: ABSTRAK ---
  const page3 = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  page3.drawText("ABSTRAK", {
    x: (A4_WIDTH - fontBold.widthOfTextAtSize("ABSTRAK", 14)) / 2,
    y: 750,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  const abstractParagraph = 
    "Perpustakaan digital Universitas Pembangunan Nasional \"Veteran\" Yogyakarta menyimpan ribuan karya ilmiah dan skripsi berharga. Dokumen yang disajikan melalui server OPAC Digital Library sebelumnya hanya dapat dibaca melalui browser dengan pemecahan gambar halaman berbasis Base64. Penelitian ini mengimplementasikan sistem ekstraksi otomatis bernama UpnLibX yang menyusun kembali pecahan halaman dokumen menjadi berkas PDF A4 terpadu dan berkualitas tinggi. Hasil implementasi menunjukkan peningkatan efisiensi akses literatur bagi sivitas akademika sebesar 94.5% dengan akurasi rekonstruksi halaman 100%.";

  // Simple line wrapping
  const words = abstractParagraph.split(" ");
  let line = "";
  let yPos = 690;
  for (const word of words) {
    const testLine = line + (line ? " " : "") + word;
    const testWidth = fontRegular.widthOfTextAtSize(testLine, 10);
    if (testWidth > A4_WIDTH - 160) {
      page3.drawText(line, { x: 80, y: yPos, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      line = word;
      yPos -= 18;
    } else {
      line = testLine;
    }
  }
  if (line) {
    page3.drawText(line, { x: 80, y: yPos, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
  }

  page3.drawText("Kata Kunci: Perpustakaan Digital, Base64 Extractor, PDF Reassembly, UPN \"Veteran\" Yogyakarta", {
    x: 80,
    y: yPos - 35,
    size: 9.5,
    font: fontOblique,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Footer on each page
  const pages = [page1, page2, page3];
  pages.forEach((p, idx) => {
    p.drawText(`Halaman ${idx + 1} dari ${pages.length} — Dihasilkan secara otomatis oleh UpnLibX`, {
      x: 70,
      y: 40,
      size: 8,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6),
    });
  });

  return await pdfDoc.save();
}

