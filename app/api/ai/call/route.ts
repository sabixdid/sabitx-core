import { NextResponse } from "next/server";
import { VoiceResponse } from "twilio/lib/twiml/VoiceResponse";
import operatorConfig from "@/config/sabitx-operator.json";

export async function POST(req: Request) {
  const form = await req.formData();
  const speech = (form.get("SpeechResult") || "").toString().toLowerCase();

  const twiml = new VoiceResponse();

  // Emergency detection
  const emergency = operatorConfig.escalation.words.some(w =>
    speech.includes(w.toLowerCase())
  );

  if (emergency) {
    twiml.say("Emergency escalation triggered. Connecting now.");
    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Determine routing keyword
  let routeKey: string | null = null;
  for (const [keyword, target] of Object.entries(operatorConfig.routing.keywords)) {
    if (speech.includes(keyword.toLowerCase())) {
      routeKey = target as string;
      break;
    }
  }

  if (!routeKey) {
    twiml.say(operatorConfig.voice.noMatch);
    twiml.redirect("/api/ai/call");
    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const route = operatorConfig.routing.routes[routeKey];

  if (route.action === "dial") {
    twiml.say(route.whisper);
    const dial = twiml.dial();
    dial.number(route.number);
  } else if (route.action === "say") {
    twiml.say(route.message);
  }

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
