export type AIAction = "formal_tamil" | "translate_en_ta" | "grammar_tamil" | "shorten" | "expand";
export type TransformAction = AIAction | "transliterate_tanglish";
export type TransformField = "department_heading" | "sender" | "recipient" | "salutation" | "signature" | "subject" | "reference" | "body";

export interface AITransformRequest {
  action: AIAction;
  field: TransformField;
  text: string;
  context?: {
    subject?: string;
    department?: string;
  };
}

export interface AITransformResult {
  text: string;
  warnings: string[];
  missingIdentifiers?: string[];
}

export interface AIProvider {
  transform(request: AITransformRequest): Promise<AITransformResult>;
}
