import "server-only";
import OpenAI from "openai";
import { buildTransformInput, TAMIL_GOVERNMENT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { AIProvider, AITransformRequest, AITransformResult } from "@/lib/ai/types";
import { containsForeignIndicScript, validateTransform } from "@/lib/ai/validation";

export class OpenAITextProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini") {
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async transform(request: AITransformRequest): Promise<AITransformResult> {
    const createResponse = (correction = "") => this.client.responses.create({
        model: this.model,
        store: false,
        max_output_tokens: 1800,
        ...(this.model.startsWith("gpt-5")
          ? { reasoning: { effort: "minimal" as const } }
          : {}),
        input: [
          { role: "system", content: TAMIL_GOVERNMENT_SYSTEM_PROMPT },
          { role: "user", content: `${buildTransformInput(request)}${correction}` }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "tamil_text_transform",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                text: { type: "string" },
                warnings: { type: "array", items: { type: "string" } }
              },
              required: ["text", "warnings"]
            }
          }
        }
      });

    let response = await createResponse();
    let parsed = JSON.parse(response.output_text) as AITransformResult;
    if (containsForeignIndicScript(parsed.text ?? "")) {
      response = await createResponse("\n\nCORRECTION REQUIRED: Return the result again using Tamil script only. The previous attempt contained forbidden non-Tamil Indic characters. Do not add or change any facts.");
      parsed = JSON.parse(response.output_text) as AITransformResult;
    }
    if (!parsed.text?.trim() || !Array.isArray(parsed.warnings)) throw new Error("Invalid structured response");
    return validateTransform(request.text, { text: parsed.text, warnings: parsed.warnings });
  }
}
