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
    description: "Automatically selects an available AI model.",
    provider: "OpenRouter",
    free: true,
    recommended: true,
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "ZENTRIX Reasoner",
    description: "Deep reasoning and complex problem-solving.",
    provider: "NVIDIA",
    free: true,
  },
  {
    id: "cohere/north-mini-code:free",
    name: "ZENTRIX Coder",
    description: "Programming and software development.",
    provider: "Cohere",
    free: true,
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "ZENTRIX General",
    description: "Everyday questions and writing.",
    provider: "Google",
    free: true,
  },
  {
    id: "nvidia/nemotron-3.5-super-vl:free",
    name: "ZENTRIX Vision",
    description: "Visual understanding and reasoning.",
    provider: "NVIDIA",
    free: true,
    recommended: true,
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "ZENTRIX Intelligence",
    description: "Advanced assistance and problem-solving.",
    provider: "Google",
    free: true,
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "ZENTRIX Speed",
    description: "Fast responses and coding assistance.",
    provider: "NVIDIA",
    free: true,
  },
  {
    id: "gemini-3.8-flash",
    name: "ZENTRIX Gemini",
    description: "Google Gemini direct integration.",
    provider: "Gemini",
    free: false,
  },
  {
    id: "openai/gpt-oss-120b",
    name: "ZENTRIX Groq",
    description: "Fast AI inference through Groq.",
    provider: "Groq",
    free: false,
  },
  {
    id: "mistral-small-latest",
    name: "ZENTRIX Mistral",
    description: "General-purpose AI through Mistral.",
    provider: "Mistral",
    free: false,
  },
  {
    id: "@cf/meta/llama-3.1-8b-instruct",
    name: "ZENTRIX Cloud",
    description: "Cloudflare Workers AI integration.",
    provider: "Cloudflare",
    free: false,
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
  return AI_MODELS;
}
