import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const url = `https://mygene.info/v3/query?q=symbol:${encodeURIComponent(symbol)}&species=human&fields=summary&size=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return NextResponse.json({ summary: null });
    const data = await res.json() as { hits?: { summary?: string }[] };
    const summary = data.hits?.[0]?.summary ?? null;
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ summary: null });
  }
}
