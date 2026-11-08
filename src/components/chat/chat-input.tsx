"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import {
  Paperclip,
  Camera,
  Mic,
  BrainCircuit,
  ImagePlus,
  X,
  FileText,
} from "lucide-react";

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
  const [thinkHarder, setThinkHarder] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{ name: string; text: string }>
  >([]);
  const [listening, setListening] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

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

    return () => recognitionRef.current?.stop();
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

  async function handleFiles(files: FileList | null) {
    if (!files) return;

    const accepted: Array<{ name: string; text: string }> = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5 MB.`);
        continue;
      }

      if (
        file.type.startsWith("text/") ||
        /\.(txt|md|csv|json|html|css|js|ts|tsx|jsx|xml|log)$/i.test(
          file.name
        )
      ) {
        accepted.push({
          name: file.name,
          text: await file.text(),
        });
      } else if (file.type === "application/pdf") {
        accepted.push({
          name: file.name,
          text: "[PDF text extraction is not enabled yet.]",
        });
      } else if (file.type.startsWith("image/")) {
        accepted.push({
          name: file.name,
          text: "[Image attachment. Visual understanding will be connected separately.]",
        });
      } else {
        accepted.push({
          name: file.name,
          text: "[Unsupported file format.]",
        });
      }
    }

    setAttachments((previous) => [
      ...previous,
      ...accepted,
    ]);
  }

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-NG";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setMessage((previous) =>
        previous +
        (previous && !previous.endsWith(" ") ? " " : "") +
        transcript
      );
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);

    textareaRef.current?.focus();
  }

  function handleSend(
    event?: FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const trimmedMessage = message.trim();

    if (
      (!trimmedMessage && attachments.length === 0) ||
      disabled ||
      isGenerating
    ) return;

    const attachmentContext = attachments
      .map(
        (file) =>
          `\n\n[Attached file: ${file.name}]\n${file.text}`
      )
      .join("");

    const modeInstruction = [
      thinkHarder
        ? "Think carefully and reason through the problem before answering. Check your work and provide an accurate response.\n\n"
        : "",
      imageMode
        ? "Generate an image based on this request: "
        : "",
    ].join("");

    onSend(
      `${modeInstruction}${
        trimmedMessage || "Please review the attached files."
      }${attachmentContext}`
    );

    setMessage("");
    setAttachments([]);
    setThinkHarder(false);
    setImageMode(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
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
    (message.trim().length > 0 || attachments.length > 0) &&
    !disabled &&
    !isGenerating;

  const toolClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition disabled:opacity-40";

  const inactiveClass =
    "border-white/10 text-slate-400 hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-violet-200";

  const activeClass =
    "border-violet-400/40 bg-violet-500/20 text-violet-200";
    return (
    <div className="w-full">
      <form
        onSubmit={handleSend}
        className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#15182a] shadow-2xl shadow-black/30 transition-all duration-200 focus-within:border-violet-400/40"
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
          className="block max-h-[180px] min-h-[58px] w-full resize-none bg-transparent px-5 pb-2 pt-5 text-[15px] leading-6 text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
        />

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-200"
              >
                <FileText className="h-4 w-4" />
                <span className="max-w-[120px] truncate">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((previous) =>
                      previous.filter((_, i) => i !== index)
                    )
                  }
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-3 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={disabled || isGenerating}
              className={`${toolClass} ${inactiveClass}`}
              title="Upload files"
              aria-label="Upload files"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              disabled={disabled || isGenerating}
              className={`${toolClass} ${inactiveClass}`}
              title="Take a photo"
              aria-label="Take a photo"
            >
              <Camera className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleVoice}
              disabled={disabled || isGenerating}
              className={`${toolClass} ${
                listening ? activeClass : inactiveClass
              }`}
              title="Voice input"
              aria-label="Voice input"
            >
              <Mic className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setThinkHarder(!thinkHarder)}
              disabled={disabled || isGenerating}
              className={`${toolClass} ${
                thinkHarder ? activeClass : inactiveClass
              }`}
              title="Think harder"
              aria-label="Think harder"
            >
              <BrainCircuit className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setImageMode(!imageMode)}
              disabled={disabled || isGenerating}
              className={`${toolClass} ${
                imageMode ? activeClass : inactiveClass
              }`}
              title="Image generation mode"
              aria-label="Image generation mode"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] text-slate-500 sm:block">
              {listening
                ? "Listening..."
                : enterToSend
                  ? "Shift + Enter for new line"
                  : "Ctrl + Enter to send"}
            </span>

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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/20 transition hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
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
        </div>
      </form>

      <p className="mt-2 text-center text-[10px] leading-5 text-slate-500">
        ZENTRIX AI can make mistakes.
      </p>
    </div>
  );
}
