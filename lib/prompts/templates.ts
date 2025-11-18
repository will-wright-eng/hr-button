export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables?: string[];
  description?: string;
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  GREETING: {
    id: "greeting",
    name: "Greeting",
    template: "Say hello and tell me a fun fact about {topic} in one sentence.",
    variables: ["topic"],
    description: "Generates a friendly greeting with a fact",
  },
  EXPLAIN: {
    id: "explain",
    name: "Explanation",
    template: "Explain {concept} in simple terms suitable for {audience}.",
    variables: ["concept", "audience"],
  },
  // Add more templates as needed
};

export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[id];
}
