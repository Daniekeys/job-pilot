import OpenAI from "openai";
import type { ZodType } from "zod";

const PROVIDER_TIMEOUT_MS = 20_000;

type ProviderConfig = {
  name: string;
  baseURL: string;
  apiKeyEnvVar: string;
  model: string;
  // OpenAI's newer models reject the legacy `max_tokens` field entirely (400 error) —
  // Gemini's and Groq's OpenAI-compat layers still expect it, so this varies per provider.
  tokensParam: "max_tokens" | "max_completion_tokens";
  // Provider-specific extra body fields not in the standard OpenAI request shape.
  extraBody?: Record<string, unknown>;
};

// Gemini and Groq both expose OpenAI-compatible chat completions endpoints, so one SDK
// covers all three providers — only baseURL/apiKey/model change per attempt.
// OpenAI is first — the developer has a paid/active key there; Gemini and Groq are the
// fallback if OpenAI fails (e.g. quota, outage).
const PROVIDERS: ProviderConfig[] = [
  {
    name: "openai",
    baseURL: "https://api.openai.com/v1",
    apiKeyEnvVar: "OPENAI_API_KEY",
    model: "gpt-5.4-mini",
    tokensParam: "max_completion_tokens",
  },
  {
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKeyEnvVar: "GEMINI_API_KEY",
    model: "gemini-3.5-flash",
    tokensParam: "max_tokens",
  },
  {
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnvVar: "GROQ_API_KEY",
    model: "openai/gpt-oss-20b",
    tokensParam: "max_tokens",
    // gpt-oss-20b is a reasoning model — it spends part of the token budget on hidden
    // reasoning before the visible answer, which left `content` empty at the default
    // effort. Extraction doesn't need deep reasoning, so cut effort to leave more
    // tokens for the actual JSON output.
    extraBody: { reasoning_effort: "low" },
  },
];

type CallWithFallbackParams<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: ZodType<T>;
  temperature: number;
  maxTokens: number;
};

type CallWithFallbackResult<T> = { success: true; data: T } | { success: false; error: string };

// Some providers emit raw newlines/tabs inside JSON string values instead of escaping
// them, which breaks strict JSON.parse. Re-escape any control character found while
// inside a string (tracked by toggling on unescaped double quotes) before retrying.
function repairUnescapedControlChars(raw: string): string {
  let result = "";
  let inString = false;
  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (char === '"' && raw[i - 1] !== "\\") {
      inString = !inString;
    }
    if (inString && (char === "\n" || char === "\r" || char === "\t")) {
      result += char === "\n" ? "\\n" : char === "\r" ? "\\r" : "\\t";
      continue;
    }
    result += char;
  }
  return result;
}

function extractJson(content: string): unknown {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : content;
  try {
    return JSON.parse(raw.trim());
  } catch {
    return JSON.parse(repairUnescapedControlChars(raw.trim()));
  }
}

async function callProvider<T>(
  provider: ProviderConfig,
  params: CallWithFallbackParams<T>,
): Promise<CallWithFallbackResult<T>> {
  const apiKey = process.env[provider.apiKeyEnvVar];
  if (!apiKey) {
    return { success: false, error: `${provider.apiKeyEnvVar} is not set` };
  }

  const client = new OpenAI({
    apiKey,
    baseURL: provider.baseURL,
    timeout: PROVIDER_TIMEOUT_MS,
    maxRetries: 0,
  });

  const requestBody: Record<string, unknown> = {
    model: provider.model,
    temperature: params.temperature,
    [provider.tokensParam]: params.maxTokens,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    ...provider.extraBody,
  };

  // Cast needed: extraBody carries provider-specific fields (e.g. Groq's
  // reasoning_effort) that aren't part of the standard OpenAI request type.
  const response = await client.chat.completions.create(
    requestBody as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  );

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { success: false, error: `${provider.name} returned no content` };
  }

  const parsed = extractJson(content);
  const result = params.schema.safeParse(parsed);
  if (!result.success) {
    return { success: false, error: `${provider.name} returned a response that didn't match the expected shape` };
  }

  return { success: true, data: result.data };
}

// Tries providers in PROVIDERS order — moves to the next one immediately on any error,
// timeout, or response that fails schema validation. Never retries the same provider.
export async function callWithFallback<T>(params: CallWithFallbackParams<T>): Promise<CallWithFallbackResult<T>> {
  const errors: string[] = [];

  for (const provider of PROVIDERS) {
    try {
      const result = await callProvider(provider, params);
      if (result.success) {
        return result;
      }
      errors.push(result.error);
    } catch (error) {
      errors.push(`${provider.name} failed: ${String(error)}`);
    }
  }

  console.error("[lib/ai-client]", errors.join(" | "));
  return { success: false, error: "All AI providers failed to respond" };
}
