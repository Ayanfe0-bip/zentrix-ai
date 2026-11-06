"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type FormEvent,
} from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  placeholder?: string;
}

const PREFERENCES_KEY = "zentrix-ai-preferences";

export default function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isGenerating = false,
  placeholder = "Message ZENTRIX...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [enterToSend, setEnterToSend] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);

      if (stored) {
        const preferences = JSON.parse(stored);

        if (typeof preferences.enterToSend === "boolean") {
          setEnterToSend(preferences.enterToSend);
        }
      }
    } catch {
      setEnterToSend(true);
    }
  }, []);

  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      180
    )}px`;
  }

  function handleSend(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || disabled || isGenerating) return;

    onSend(trimmedMessage);
    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const sendShortcut =
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey);

    const normalSend =
      event.key === "Enter" &&
      enterToSend &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey;

    if (sendShortcut || normalSend) {
      event.preventDefault();
      handleSend();
    }
  }

  const canSend =
    message.trim().length > 0 &&
    !disabled &&
    !isGenerating;

  return (
    <div className="w-full">
      <form
        onSubmit={handleSend}
        className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#15182a] shadow-2xl shadow-black/30 transition-all duration-200 focus-within:border-violet-400/40 focus-within:shadow-violet-950/20"
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            resizeTextarea();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || isGenerating}
          placeholder={placeholder}
          rows={1}
          aria-label="Message ZENTRIX"
          className="block max-h-[180px] min-h-[58px] w-full resize-none bg-transparent px-5 pb-2 pt-5 text-[15px] leading-6 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="flex items-center justify-between gap-3 px-3 pb-3 pl-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">
              {enterToSend
                ? "Shift + Enter for new line"
                : "Ctrl + Enter to send"}
            </span>
          </div>

          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              disabled={!onStop}
              className="flex h-10 items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              <span className="h-2.5 w-2.5 rounded-sm bg-red-400" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/20 transition hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="h-5 w-5"
              >
                <path
                  d="M12 19V5m-7 7 7-7 7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      <p className="mt-2 text-center text-[10px] leading-5 text-slate-500">
        ZENTRIX AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
