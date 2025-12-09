import { NextResponse } from "next/server";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import operatorConfig from "../../../config/sabitx-operator.json";

export async function POST(req: Request) {
  const body = await req.formData();
  const speech = (body.get("SpeechResult") || "").toString().toLowerCase();

  const twiml = new VoiceResponse();

  // Emergency detection
  const emergencyHits = operatorConfig.escalation.words.some(w =>
    speech.includes(w)
  );

  if (emergencyHits) {
    twiml.say("Emergency escalation triggered. Connecting now.");
    twiml.redirect("/api/ai/emergency");
    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" }
    });
  }

  // Determine route based on keywords
  let routeKey = null;
  for (const [keyword, target] of Object.entries(operatorConfig.routing.keywords)) {
    if (speech.includes(keyword.toLowerCase())) {
      routeKey = target;
      break;
    }
  }

  // Fallback
  if (!routeKey) {
    twiml.say(operatorConfig.voice.noMatch);
    twiml.redirect("/api/ai/call");
    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" }
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
    headers: { "Content-Type": "text/xml" }
  });
}
