export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  free: boolean;
  recommended?: boolean;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "openrouter/free",
    name: "Auto Select",
    description: "Automatically selects an available free model.",
    provider: "OpenRouter",
    free: true,
    recommended: true,
  },
];

export const DEFAULT_MODEL = "openrouter/free";

export function getAIModel(modelId: string): AIModel | undefined {
  return AI_MODELS.find((model) => model.id === modelId);
}

export function getAvailableModels(): AIModel[] {
  return AI_MODELS.filter((model) => model.free);
}
