export const DEFAULT_ARCHITECT_MODEL = "openai/gpt-oss-120b";
export const DEFAULT_OPERATOR_MODEL = "alibaba/qwen3-coder-30b-a3b";

export function configureRuntimeModels() {
  process.env.SABITX_ARCHITECT_MODEL ||= DEFAULT_ARCHITECT_MODEL;
  process.env.SABITX_OPERATOR_MODEL ||= DEFAULT_OPERATOR_MODEL;

  return {
    architect: process.env.SABITX_ARCHITECT_MODEL,
    operator: process.env.SABITX_OPERATOR_MODEL,
  };
}
