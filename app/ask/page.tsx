import type { Metadata } from "next";
import RunConsole from "../run/RunConsole";

export const metadata: Metadata = {
  title: "ASK | SABITX",
  description: "Send an objective into the SABITX architect/operator pipeline.",
};

export default function AskPage() {
  return <RunConsole surface="ASK" />;
}
