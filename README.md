# UpnLibX 🚀
> **UPN "Veteran" Yogyakarta Digital Library Fulltext Extractor & PDF Generator**

UpnLibX adalah aplikasi web modern berbasis **Next.js 16 (App Router), TypeScript, dan Tailwind CSS** yang dirancang untuk mengekstrak dan merekonstruksi skripsi, tesis, dan tugas akhir utuh dari repositori digital lokal perpustakaan UPN "Veteran" Yogyakarta (OPAC Digital Library).

---

## 🎯 Mengapa UpnLibX Dibuat?

Sistem OPAC perpustakaan UPN (`192.168.36.203/libsys_digit_upnvyk/opac/`) aslinya **mengunci dokumen** dan hanya menampilkan lembaran halaman dalam bentuk potongan gambar Base64 Data-URI di dalam browser tanpa tombol unduh PDF resmi. 

Selain itu, terdapat **bug rendering server bawaan UPN** yang mencetak setiap halaman sebanyak **2 kali berturut-turut** (misalnya dokumen 70 halaman menjadi 140 tag `<img>`).

**UpnLibX menyelesaikan seluruh masalah tersebut:**
1. **Ekstraksi Base64 Otomatis:** Mengambil seluruh lembaran gambar langsung dari DOM HTML repositori.
2. **Sequential Deduplication:** Mengeliminasi 50% halaman duplikat server secara presisi (`rawMatches[i] !== rawMatches[i-1]`).
3. **Penyusunan PDF A4 In-Memory:** Menggunakan engine `pdf-lib` untuk menyusun lembaran ke kanvas A4 standar (`595.28 x 841.89 pt`) dengan penskalaan proporsional terpusat.
4. **Pratinjau PDF Terintegrasi:** Memungkinkan pengguna memeriksa hasil PDF langsung di browser sebelum atau sesudah mengunduh.
5. **Mode Demo Siap Pakai:** Pengguna dapat menguji seluruh alur ekstraksi secara offline/di luar kampus tanpa harus terhubung ke Wi-Fi kampus UPN.

---

## 💻 Tech Stack

- **Framework:** Next.js 16.4+ (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4, Custom Obsidian & UPN Emerald Palette
- **Animation & Motion:** Framer Motion, Canvas Confetti
- **PDF Engine:** `pdf-lib` (In-memory buffer rendering)
- **Icons:** Lucide React

---

## 🚀 Menjalankan Aplikasi Secara Lokal

### 1. Install Dependensi
```bash
npm install
```

### 2. Jalankan Development Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 3. Build untuk Produksi
```bash
npm run build
npm run start
```

---

## 🌐 Catatan Akses Jaringan Intranet UPN

Tautan dokumen repositori UPN memiliki format:
```text
http://192.168.36.203/libsys_digit_upnvyk/opac/index.php/home/open?a2Ri=...&kzbd=...&file=...&token=...
```
* **Alamat IP `192.168.36.203` adalah IP jaringan internal (intranet) kampus.**
* Untuk mengakses server asli, perangkat harus terhubung ke jaringan **Wi-Fi UPN** (seperti *UPN-Free*, *UPN-Hotspot*, atau *Eduroam*) di lingkungan kampus Condongcatur / Babarsari.
* Jika Anda sedang berada di luar kampus, gunakan tombol **"Mode Demo"** atau masukkan `demo` pada kolom input untuk menguji coba ekstraksi dan pembuatan berkas PDF.

---

## 📂 Struktur Proyek

```
upnlibX/
├── app/
│   ├── api/
│   │   ├── extract/route.ts        # Core Scraper, Deduplicator & PDF Generator
│   │   └── intranet-status/route.ts# Ping & status jangkauan IP 192.168.36.203
│   ├── globals.css                 # Dark obsidian theme & UPN emerald glow
│   ├── layout.tsx                  # SEO metadata, viewport, font configuration
│   └── page.tsx                    # Main Page Interface
├── components/
│   ├── ExtractorCard.tsx           # Input URL, Paste, Stepper Progress & Result
│   ├── FaqSection.tsx              # Pertanyaan umum & troubleshooting
│   ├── Features.tsx                # Penjelasan arsitektur teknis
│   ├── Footer.tsx                  # Footer & etika pengutipan ilmiah
│   ├── GuideModal.tsx              # Panduan visual cara mengambil link OPAC
│   ├── Hero.tsx                    # Hero typography & branding
│   ├── Navbar.tsx                  # Status intranet & tombol navigasi
│   ├── PdfPreviewModal.tsx         # In-browser PDF Viewer
│   └── RecentHistory.tsx           # Riwayat ekstraksi sesi lokal
├── lib/
│   ├── demo-generator.ts           # Generator PDF dokumen contoh UPNVYK
│   ├── upn-parser.ts               # Parser & validator tautan OPAC UPN
│   └── utils.ts                    # Utility class merger & byte formatter
├── package.json
└── README.md
```

---

## 📜 Lisensi & Etika Akademik

Aplikasi ini dikembangkan untuk tujuan edukasi dan mempermudah civitas akademika dalam membaca referensi ilmiah. Harap gunakan dokumen hasil ekstraksi secara bertanggung jawab dan selalu cantumkan sitasi sesuai kaidah etika penulisan karya ilmiah.
