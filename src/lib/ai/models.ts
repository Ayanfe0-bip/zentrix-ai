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
    description:
      "Automatically selects an available free AI model.",
    provider: "OpenRouter",
    free: true,
    recommended: true,
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "ZENTRIX Reasoner",
    description:
      "Deep reasoning, research and complex problem-solving.",
    provider: "NVIDIA",
    free: true,
  },
  {
    id: "cohere/north-mini-code:free",
    name: "ZENTRIX Coder",
    description:
      "Programming, debugging and software development.",
    provider: "Cohere",
    free: true,
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "ZENTRIX General",
    description:
      "Everyday questions, explanations and writing.",
    provider: "Google",
    free: true,
  },
  {
    id: "nvidia/nemotron-3.5-super-vl:free",
    name: "ZENTRIX Vision",
    description:
      "Advanced reasoning, research and visual understanding.",
    provider: "NVIDIA",
    free: true,
    recommended: true,
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "ZENTRIX Intelligence",
    description:
      "Advanced general assistance, coding and writing.",
    provider: "Google",
    free: true,
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "ZENTRIX Speed",
    description:
      "Fast responses, coding assistance and agent workflows.",
    provider: "NVIDIA",
    free: true,
  },
];

export const DEFAULT_MODEL = "openrouter/free";

export function getAIModel(
  modelId: string
): AIModel | undefined {
  return AI_MODELS.find(
    (model) => model.id === modelId
  );
}

export function getAvailableModels(): AIModel[] {
  return AI_MODELS.filter(
    (model) => model.free
  );
}
