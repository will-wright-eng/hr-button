import { PromptTemplate, getPromptTemplate } from "./templates";

export class PromptBuilder {
  private template: PromptTemplate;
  private variables: Map<string, string> = new Map();

  constructor(templateId: string) {
    const template = getPromptTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    this.template = template;
  }

  setVariable(name: string, value: string): this {
    this.variables.set(name, value);
    return this;
  }

  setVariables(vars: Record<string, string>): this {
    Object.entries(vars).forEach(([key, value]) => {
      this.variables.set(key, value);
    });
    return this;
  }

  build(): string {
    let prompt = this.template.template;

    // Replace variables in template
    this.variables.forEach((value, key) => {
      prompt = prompt.replace(`{${key}}`, value);
    });

    // Validate all variables are replaced
    const missingVars = prompt.match(/{(\w+)}/g);
    if (missingVars) {
      throw new Error(`Missing variables: ${missingVars.join(", ")}`);
    }

    return prompt;
  }

  static fromString(text: string): PromptBuilder {
    // Create a builder from raw text
    const builder = Object.create(PromptBuilder.prototype);
    builder.template = { id: "custom", name: "Custom", template: text };
    builder.variables = new Map();
    return builder;
  }
}

// Usage example:
// const prompt = new PromptBuilder('GREETING')
//   .setVariable('topic', 'AI')
//   .build();
