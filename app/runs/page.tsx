import type { Metadata } from "next";
import RunsClient from "./RunsClient";

export const metadata: Metadata = {
  title: "RUNS | SABITX",
  description: "Local verified run history for the SABITX execution surface.",
};

export default function RunsPage() {
  return <RunsClient />;
}
