export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  free: boolean;
  recommended?: boolean;
}

// One public model. Provider selection and failover
// happen automatically behind the scenes.
export const AI_MODELS: AIModel[] = [
  {
    id: "zentrix/auto",
    name: "ZENTRIX AI",
    description:
      "Automatically selects an available connected AI provider for your requests.",
    provider: "Auto",
    free: true,
    recommended: true,
  },
];

export const DEFAULT_MODEL = "zentrix/auto";

export function getAIModel(modelId: string): AIModel | undefined {
  return AI_MODELS.find((model) => model.id === modelId);
}

export function getAvailableModels(): AIModel[] {
  return AI_MODELS;
}
