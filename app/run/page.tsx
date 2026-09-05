import type { Metadata } from "next";
import RunConsole from "./RunConsole";

export const metadata: Metadata = {
  title: "SABITX RUN",
  description:
    "SABITX coding agent: propose changes, review the build, and approve a verified result branch.",
};

export default function RunPage() {
  return <RunConsole surface="RUN" />;
}
