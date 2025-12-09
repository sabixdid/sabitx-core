import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const msg = (form.get("Body") || "").toString();

  const isOtp = /\b\d{4,8}\b/.test(msg);

  const reply = isOtp
    ? "Verification code received on SABITX line."
    : "Message received.";

  const xml = `
    <Response>
      <Message>${reply}</Message>
    </Response>
  `;

  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}
