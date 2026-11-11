import { NextResponse } from "next/server";

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch("http://192.168.36.203/libsys_digit_upnvyk/opac/", {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    return NextResponse.json({
      connected: res.ok || res.status < 500,
      status: res.status,
      timestamp: Date.now(),
      message: "Server terhubung langsung ke Intranet Perpustakaan UPN.",
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    return NextResponse.json({
      connected: false,
      timestamp: Date.now(),
      message: "Server berada di luar jaringan Intranet UPN (192.168.36.203).",
      reason: err.name === "AbortError" ? "Timeout" : "Unreachable",
    });
  }
}
