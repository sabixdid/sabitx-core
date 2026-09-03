import type { Metadata } from "next";
import RunConsole from "./RunConsole";

export const metadata: Metadata = {
  title: "RUN | SABITX",
  description:
    "SABITX execution surface: architect intent, operator plan, verified state.",
};

export default function RunPage() {
  return <RunConsole surface="RUN" />;
}
