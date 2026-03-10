import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SAMPLE_SERVICE_URL ?? "http://localhost:8083";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  const url = `${BASE}${path?.length ? `/${path.join("/")}` : ""}${req.nextUrl.search}`;
  const upstream = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    // @ts-expect-error — duplex required for streaming body passthrough
    duplex: "half",
  });
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
