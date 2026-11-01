export interface ParsedUpnUrl {
  isValid: boolean;
  isDemo: boolean;
  filename?: string;
  token?: string;
  a2Ri?: string;
  kzbd?: string;
  error?: string;
}

export function parseUpnUrl(urlString: string): ParsedUpnUrl {
  if (!urlString || typeof urlString !== "string") {
    return { isValid: false, isDemo: false, error: "URL tidak boleh kosong." };
  }

  const trimmed = urlString.trim();

  // Check demo trigger
  if (
    trimmed.toLowerCase() === "demo" ||
    trimmed.includes("demo-sample") ||
    trimmed.includes("upnlibx-demo")
  ) {
    return {
      isValid: true,
      isDemo: true,
      filename: "Contoh_Skripsi_UPN_Teknik_Informatika_2024.pdf",
      token: "DEMO-SAMPLE-TOKEN-UPNVYK",
      a2Ri: "sample-db",
      kzbd: "sample-kzbd",
    };
  }

  try {
    let normalized = trimmed;
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "http://" + normalized;
    }

    const url = new URL(normalized);
    
    // Check if IP matches UPN library IP or hostname
    const isUpnHost =
      url.hostname === "192.168.36.203" ||
      url.hostname.includes("upnyk.ac.id") ||
      url.pathname.includes("libsys_digit_upnvyk");

    const a2Ri = url.searchParams.get("a2Ri") || undefined;
    const kzbd = url.searchParams.get("kzbd") || undefined;
    const file = url.searchParams.get("file") || undefined;
    const token = url.searchParams.get("token") || undefined;

    if (!isUpnHost && !file && !token) {
      return {
        isValid: false,
        isDemo: false,
        error: "URL harus berasal dari server OPAC UPN (192.168.36.203/libsys_digit_upnvyk).",
      };
    }

    return {
      isValid: true,
      isDemo: false,
      filename: file ? (file.endsWith(".pdf") ? file : `${file}.pdf`) : undefined,
      token,
      a2Ri,
      kzbd,
    };
  } catch {
    return {
      isValid: false,
      isDemo: false,
      error: "Format URL tidak valid. Pastikan menyalin link lengkap.",
    };
  }
}
