import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.formData();
  const from = body.get("From");
  const msg = body.get("Body")?.toString() || "";

  // Auto-acknowledge OTP or verification codes
  const isOtp = /\b\d{4,8}\b/.test(msg);

  let reply = "Message received.";
  if (isOtp) reply = "Verification code received on SABITX line.";

  const xml = `
    <Response>
      <Message>${reply}</Message>
    </Response>
  `;

  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" }
  });
}
