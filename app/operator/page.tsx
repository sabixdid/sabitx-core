import type { Metadata } from "next";
import RunConsole from "../run/RunConsole";

export const metadata: Metadata = {
  title: "OPERATOR | SABITX",
  description: "SABITX operator execution planning surface.",
};

export default function OperatorPage() {
  return <RunConsole surface="OPERATOR" />;
}
