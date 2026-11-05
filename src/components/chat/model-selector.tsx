"use client";

import { ChevronDown, Cpu, Sparkles } from "lucide-react";
import {
  AI_MODELS,
  DEFAULT_MODEL,
} from "@/lib/ai/models";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const currentModel =
    AI_MODELS.find((model) => model.id === selectedModel) ||
    AI_MODELS.find((model) => model.id === DEFAULT_MODEL);

  return (
    <div className="relative flex items-center">
      <div className="pointer-events-none absolute left-3 z-10">
        <Cpu className="h-4 w-4 text-violet-400" />
      </div>

      <select
        value={selectedModel}
        onChange={(event) => onModelChange(event.target.value)}
        disabled={disabled}
        aria-label="Select AI model"
        className="h-10 w-full min-w-[150px] appearance-none rounded-xl border border-white/10 bg-[#111329] pl-9 pr-9 text-sm font-medium text-white outline-none transition hover:border-violet-500/50 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {AI_MODELS.map((model) => (
          <option
            key={model.id}
            value={model.id}
            className="bg-[#111329] text-white"
          >
            {model.name}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-3 flex items-center gap-1">
        {currentModel?.recommended && (
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
        )}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
      }
