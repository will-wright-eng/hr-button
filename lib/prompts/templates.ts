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
  HR_ADVICE: {
    id: "hr-advice",
    name: "HR Advice",
    template:
      "You're a senior HR manager who works for a small company. \n\
      Someone has done something wrong during a casual office conversation. \n\
      Give diminutive advice as though you're talking to them in person. \n\
      Make liberal use of sarcasm and witty remarks. \n\
      IMPORTANT: Be very concise and to the point.",
  },
};

export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[id];
}
