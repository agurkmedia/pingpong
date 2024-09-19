import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = `http://localhost:8000${url.pathname}${url.search}`;

  const response = await fetch(targetUrl, {
    headers: request.headers,
    method: request.method,
  });

  return NextResponse.json(await response.json());
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = `http://localhost:8000${url.pathname}${url.search}`;

  const response = await fetch(targetUrl, {
    headers: request.headers,
    method: request.method,
    body: request.body,
  });

  return NextResponse.json(await response.json());
}