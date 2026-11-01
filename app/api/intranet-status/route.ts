import { NextResponse } from "next/server";

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch("http://192.168.36.203/libsys_digit_upnvyk/opac/", {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return NextResponse.json({
      connected: res.ok || res.status < 500,
      status: res.status,
      timestamp: Date.now(),
      message: "Terhubung langsung ke Intranet Perpustakaan UPN.",
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    return NextResponse.json({
      connected: false,
      timestamp: Date.now(),
      message: "Tidak terhubung ke Intranet UPN (192.168.36.203).",
      reason: err.name === "AbortError" ? "Timeout" : "Unreachable",
    });
  }
}
