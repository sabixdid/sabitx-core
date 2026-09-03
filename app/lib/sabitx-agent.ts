import { randomUUID } from "node:crypto";

export const ARCHITECT_MODEL =
  process.env.SABITX_ARCHITECT_MODEL || "openai/gpt-5.6-sol";
export const OPERATOR_MODEL =
  process.env.SABITX_OPERATOR_MODEL || "anthropic/claude-sonnet-5";

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const GATEWAY_TIMEOUT_MS = 55_000;

export type ExecutionSpec = {
  objective: string;
  requirements: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  implementationInstructions: string[];
};

export type AgentRun = {
  id: string;
  state: "planned";
  createdAt: string;
  objective: string;
  specification: ExecutionSpec;
  operatorPlan: string;
  models: { architect: string; operator: string };
  usage: {
    architect: Record<string, unknown> | null;
    operator: Record<string, unknown> | null;
  };
  verification: {
    architectSchema: "passed";
    operatorOutput: "received";
    externalActionsExecuted: false;
  };
  timingMs: { architect: number; operator: number; total: number };
};

type GatewayMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GatewayCompletion = {
  content: string;
  model: string;
  usage?: Record<string, unknown>;
};

type GatewayContent =
  | string
  | Array<{ type?: string; text?: string }>
  | undefined;

type GatewayPayload = {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  usage?: Record<string, unknown>;
  error?: { message?: string };
};

const ARCHITECT_PROMPT = `You are the SABITX ARCHITECT.
Convert the objective into a precise execution specification for an operator.

Return ONLY one valid JSON object with exactly these keys:
- objective: string
- requirements: string[]
- constraints: string[]
- acceptanceCriteria: string[]
- implementationInstructions: string[]

Rules:
- Every array must contain at least one concise, concrete item.
- Preserve the user's intent; do not inflate scope.
- Separate facts from assumptions.
- Make acceptance criteria observable.
- Never include markdown fences or keys beyond the five specified.`;

const OPERATOR_PROMPT = `You are the SABITX OPERATOR.
You receive a validated execution specification from the architect.
Produce the smallest executable plan that can ship, in ordered steps.

Required structure:
1. DECISION
2. EXECUTION SEQUENCE
3. VERIFICATION
4. BLOCKERS / APPROVAL GATES
5. SINGLE NEXT MOVE

Be concrete. Reference files, routes, commands, systems, owners, or evidence when relevant.
Do not claim an external action was completed unless the provided specification proves it.
Do not add generic advice or expand the project unnecessarily.`;

export function gatewayIsConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

function getGatewayToken() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
}

function readMessageContent(content: GatewayContent) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text?.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function gatewayRequest(
  model: string,
  messages: GatewayMessage[],
  maxTokens: number,
  useJsonFormat: boolean
): Promise<GatewayCompletion> {
  const token = getGatewayToken();
  if (!token) {
    throw new Error("AI Gateway authentication is unavailable on this deployment.");
  }

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ai-reporting-tags":
          "system:sabitx,surface:run,pipeline:architect-operator",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: maxTokens,
        ...(useJsonFormat
          ? { response_format: { type: "json_object" as const } }
          : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(`AI Gateway timed out while calling ${model}.`);
    }
    throw error;
  }

  const payload = (await response.json().catch(() => null)) as
    | GatewayPayload
    | null;

  if (!response.ok) {
    const detail = payload?.error?.message || `Gateway returned ${response.status}`;
    const gatewayError = new Error(detail) as Error & { status?: number };
    gatewayError.status = response.status;
    throw gatewayError;
  }

  const content = readMessageContent(payload?.choices?.[0]?.message?.content);
  if (!content) {
    throw new Error("AI Gateway returned an empty response.");
  }

  return {
    content,
    model: payload?.model || model,
    usage: payload?.usage,
  };
}

async function callGateway(
  model: string,
  messages: GatewayMessage[],
  maxTokens: number,
  requestJson = false
) {
  try {
    return await gatewayRequest(model, messages, maxTokens, requestJson);
  } catch (error) {
    const status = (error as Error & { status?: number }).status;
    const detail = error instanceof Error ? error.message.toLowerCase() : "";
    const jsonFormatRejected =
      requestJson &&
      (status === 400 ||
        detail.includes("response_format") ||
        detail.includes("json_object"));

    if (!jsonFormatRejected) throw error;

    return gatewayRequest(model, messages, maxTokens, false);
  }
}

function extractJsonObject(raw: string) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) {
      throw new Error("Architect output did not contain a JSON object.");
    }
    return JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  }
}

function stringArray(value: unknown, field: string) {
  if (!Array.isArray(value)) {
    throw new Error(`Architect field ${field} must be an array.`);
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) {
    throw new Error(`Architect field ${field} cannot be empty.`);
  }

  return items;
}

function validateExecutionSpec(value: unknown): ExecutionSpec {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Architect output must be a JSON object.");
  }

  const record = value as Record<string, unknown>;
  const objective =
    typeof record.objective === "string" ? record.objective.trim() : "";

  if (!objective) {
    throw new Error("Architect field objective cannot be empty.");
  }

  return {
    objective,
    requirements: stringArray(record.requirements, "requirements"),
    constraints: stringArray(record.constraints, "constraints"),
    acceptanceCriteria: stringArray(
      record.acceptanceCriteria,
      "acceptanceCriteria"
    ),
    implementationInstructions: stringArray(
      record.implementationInstructions,
      "implementationInstructions"
    ),
  };
}

export async function executeAgent(objective: string): Promise<AgentRun> {
  const requestStartedAt = Date.now();

  const architectStartedAt = Date.now();
  const architect = await callGateway(
    ARCHITECT_MODEL,
    [
      { role: "system", content: ARCHITECT_PROMPT },
      { role: "user", content: `OBJECTIVE\n${objective}` },
    ],
    1_400,
    true
  );
  const specification = validateExecutionSpec(
    extractJsonObject(architect.content)
  );
  const architectDurationMs = Date.now() - architectStartedAt;

  const operatorStartedAt = Date.now();
  const operator = await callGateway(
    OPERATOR_MODEL,
    [
      { role: "system", content: OPERATOR_PROMPT },
      {
        role: "user",
        content: `VALIDATED EXECUTION SPECIFICATION\n${JSON.stringify(
          specification,
          null,
          2
        )}`,
      },
    ],
    2_200
  );
  const operatorDurationMs = Date.now() - operatorStartedAt;

  return {
    id: randomUUID(),
    state: "planned",
    createdAt: new Date().toISOString(),
    objective,
    specification,
    operatorPlan: operator.content,
    models: {
      architect: architect.model,
      operator: operator.model,
    },
    usage: {
      architect: architect.usage || null,
      operator: operator.usage || null,
    },
    verification: {
      architectSchema: "passed",
      operatorOutput: "received",
      externalActionsExecuted: false,
    },
    timingMs: {
      architect: architectDurationMs,
      operator: operatorDurationMs,
      total: Date.now() - requestStartedAt,
    },
  };
}
