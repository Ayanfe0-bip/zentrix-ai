"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type FormEvent,
} from "react";

import {
  Plus,
  X,
  FileUp,
  Images,
  Camera,
  Mic,
  MicOff,
  BrainCircuit,
  ImagePlus,
  PlugZap,
  ArrowUp,
  Square,
  FileText,
  Play,
Trash2,
Send,
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
  placeholder = "Message ZENTRIX AI...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [enterToSend, setEnterToSend] = useState(true);
  const [thinkHarder, setThinkHarder] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{ name: string; text: string }>
  >([]);
  const [listening, setListening] = useState(false);
const [voicePreview, setVoicePreview] = useState(false);
const [voiceTranscribing, setVoiceTranscribing] = useState(false);
const [voiceText, setVoiceText] = useState("");
const [recordingSeconds, setRecordingSeconds] = useState(0);
const [audioUrl, setAudioUrl] = useState("");

const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
const audioBlobRef = useRef<Blob | null>(null);
const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        const preferences = JSON.parse(saved) as {
          enterToSend?: boolean;
        };
        setEnterToSend(preferences.enterToSend !== false);
      }
    } catch {
      setEnterToSend(true);
    }
  }, []);
  
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function resizeTextarea() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }

  function openFilePicker(type: "files" | "photos" | "camera") {
    setMenuOpen(false);

    if (type === "files") fileRef.current?.click();
    if (type === "photos") photoRef.current?.click();
    if (type === "camera") cameraRef.current?.click();
  }

  async function handleFiles(fileList: FileList | null) {
  if (!fileList) return;

  const accepted: Array<{ name: string; text: string }> = [];

  for (const file of Array.from(fileList)) {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is larger than 5 MB.`);
      continue;
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ?? "";

    const isText =
      file.type.startsWith("text/") ||
      [
        "txt", "md", "csv", "json", "html",
        "css", "js", "ts", "tsx", "jsx",
        "xml", "log",
      ].includes(extension);

    if (isText) {
      try {
        const text = await file.text();

        accepted.push({
          name: file.name,
          text,
        });
      } catch {
        alert(`Could not read ${file.name}.`);
      }

      continue;
    }

    if (
      file.type === "application/pdf" ||
      extension === "pdf"
    ) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/pdf", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json()) as {
          success?: boolean;
          text?: string;
          totalPages?: number;
          truncated?: boolean;
          error?: string;
        };

        if (!response.ok || !result.success || !result.text) {
          throw new Error(
            result.error || "Could not extract PDF text."
          );
        }

        accepted.push({
          name: file.name,
          text:
            `[PDF CONTENT - ${result.totalPages ?? "Unknown"} pages]\n\n` +
            result.text +
            (result.truncated
              ? "\n\n[Note: PDF text was shortened because it exceeded the extraction limit.]"
              : ""),
        });
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : `Could not read ${file.name}.`
        );
      }

      continue;
    }

    if (file.type.startsWith("image/")) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/vision", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as {
      success?: boolean;
      text?: string;
      error?: string;
    };

    if (!response.ok || !result.success || !result.text) {
      throw new Error(
        result.error || "Could not understand this image."
      );
    }

    accepted.push({
      name: file.name,
      text:
        `[IMAGE ANALYSIS - ${file.name}]\n\n` +
        result.text,
    });
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : `Could not analyze ${file.name}.`
    );
  }

  continue;
    }

    alert(`${file.name} is not a supported file type.`);
  }

  setAttachments((previous) => [...previous, ...accepted]);
  }
    function formatRecordingTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  async function startVoiceRecording() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Your browser does not support voice recording.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      let recorder: MediaRecorder;

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });
      } else {
        recorder = new MediaRecorder(stream);
      }

      audioChunksRef.current = [];
      audioBlobRef.current = null;

      setRecordingSeconds(0);
      setVoiceText("");
      setVoicePreview(false);
      setListening(true);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        audioBlobRef.current = blob;

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setListening(false);
        setVoicePreview(true);

        stream.getTracks().forEach((track) => track.stop());

        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        if (blob.size > 0) {
          void transcribeVoiceRecording(blob);
        }
      };

      recorder.start();

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((previous) => previous + 1);
      }, 1000);
    } catch (error) {
      console.error("Voice recording error:", error);
      setListening(false);

      alert(
        "Microphone access failed. Please allow microphone permission and try again."
      );
    }
  }

  function stopVoiceRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }

  async function transcribeVoiceRecording(blob: Blob) {
    setVoiceTranscribing(true);

    try {
      const formData = new FormData();

      formData.append("audio", blob, "voice.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        success?: boolean;
        text?: string;
        error?: string;
      };

      if (!response.ok || !result.success || !result.text) {
        throw new Error(
          result.error || "Could not transcribe your recording."
        );
      }

      setVoiceText(result.text);
    } catch (error) {
      console.error("Voice transcription error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Voice transcription failed."
      );
    } finally {
      setVoiceTranscribing(false);
    }
  }

  function discardVoice() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    audioBlobRef.current = null;

    setListening(false);
    setVoicePreview(false);
    setVoiceTranscribing(false);
    setVoiceText("");
    setRecordingSeconds(0);
    setAudioUrl("");
  }

  function sendVoiceText() {
    const trimmedText = voiceText.trim();

    if (!trimmedText || voiceTranscribing || disabled) return;

    let finalMessage = trimmedText;

    if (thinkHarder) {
      finalMessage =
        "[Think harder: Take more time to reason carefully, check your work, and provide an accurate answer.]\n\n" +
        finalMessage;
    }

    if (imageMode) {
      finalMessage =
        "Generate an image based on this request:\n\n" +
        finalMessage;
    }

    onSend(finalMessage);

    setThinkHarder(false);
    setImageMode(false);
    discardVoice();
            }
  function handleSend(event?: FormEvent) {
    event?.preventDefault();

    if (isGenerating) {
      onStop?.();
      return;
    }

    if (disabled) return;

    const trimmedMessage = message.trim();

    if (!trimmedMessage && attachments.length === 0) return;

    let finalMessage = trimmedMessage;

    if (attachments.length > 0) {
      const attachmentContent = attachments
        .map(
          (file) =>
            `\n\n[Attached file: ${file.name}]\n${file.text}`
        )
        .join("\n");

      finalMessage += attachmentContent;
    }

    if (thinkHarder) {
      finalMessage =
        "[Think harder: Take more time to reason carefully, check your work, and provide an accurate answer.]\n\n" +
        finalMessage;
    }

    if (imageMode) {
      finalMessage =
        "Generate an image based on this request:\n\n" +
        finalMessage;
    }

    onSend(finalMessage);

    setMessage("");
    setAttachments([]);
    setThinkHarder(false);
    setImageMode(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (fileRef.current) fileRef.current.value = "";
    if (photoRef.current) photoRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      enterToSend
    ) {
      event.preventDefault();
      handleSend();
    }

    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      handleSend();
    }
  }

  function removeAttachment(index: number) {
    setAttachments((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSend}
        className="relative mx-auto w-full max-w-4xl"
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.csv,.json,.html,.css,.js,.ts,.tsx,.jsx,.xml,.log,text/*"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <input
          ref={photoRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300"
              >
                <FileText size={14} className="shrink-0" />

                <span className="max-w-[180px] truncate">
                  {file.name}
                </span>

                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-400"
                  aria-label="Remove attachment"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {(thinkHarder || imageMode) && (
          <div className="mb-2 flex flex-wrap gap-2">
            {thinkHarder && (
              <button
                type="button"
                onClick={() => setThinkHarder(false)}
                className="flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300"
              >
                <BrainCircuit size={13} />
                Think harder
                <X size={12} />
              </button>
            )}

            {imageMode && (
              <button
                type="button"
                onClick={() => setImageMode(false)}
                className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300"
              >
                <ImagePlus size={13} />
                Create image
                <X size={12} />
              </button>
            )}
          </div>
        )}
               {listening && (
          <div className="mb-3 rounded-2xl border border-red-500/20 bg-[#1c1719] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-medium text-white">
                  Recording voice...
                </span>
              </div>

              <span className="font-mono text-sm text-red-400">
                {formatRecordingTime(recordingSeconds)}
              </span>
            </div>

            <div className="my-5 flex h-10 items-center justify-center gap-1">
              {Array.from({ length: 35 }).map((_, index) => (
                <span
                  key={index}
                  className="w-1 rounded-full bg-red-400"
                  style={{
                    height: `${10 + Math.random() * 28}px`,
                    animation: `pulse 0.7s ease-in-out ${
                      index * 0.04
                    }s infinite alternate`,
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={stopVoiceRecording}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600"
            >
              <Square size={16} />
              Stop recording
            </button>
          </div>
        )}

        {voicePreview && (
          <div className="mb-3 rounded-2xl border border-white/10 bg-[#202020] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Voice message
                </p>
                <p className="text-xs text-gray-400">
                  {formatRecordingTime(recordingSeconds)} recorded
                </p>
              </div>

              <button
                type="button"
                onClick={discardVoice}
                className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-red-400"
                aria-label="Discard recording"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {audioUrl && (
              <audio
                controls
                src={audioUrl}
                className="mb-4 w-full"
              />
            )}

            <p className="mb-2 text-xs font-medium text-gray-400">
              TRANSCRIPTION
            </p>

            {voiceTranscribing ? (
              <div className="rounded-xl bg-white/5 p-4 text-sm text-purple-300">
                Transcribing your voice...
              </div>
            ) : (
              <textarea
                value={voiceText}
                onChange={(event) => setVoiceText(event.target.value)}
                placeholder="Your transcribed message will appear here..."
                rows={3}
                className="w-full resize-y rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white outline-none placeholder:text-gray-500 focus:border-purple-500/50"
              />
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={discardVoice}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-gray-300 hover:bg-white/5"
              >
                <Trash2 size={16} />
                Discard
              </button>

              <button
                type="button"
                onClick={sendVoiceText}
                disabled={
                  voiceTranscribing || !voiceText.trim() || disabled
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black hover:bg-gray-200 disabled:opacity-30"
              >
                <Send size={16} />
                Send message
              </button>
            </div>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-[28px] border border-white/10 bg-[#171717] p-2 shadow-lg">
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              disabled={disabled || isGenerating}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                menuOpen
                  ? "rotate-45 bg-purple-600 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
              aria-label="Open tools menu"
              aria-expanded={menuOpen}
            >
              <Plus size={23} />
            </button>

            {menuOpen && (
              <div className="absolute bottom-14 left-0 z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#202020] p-2 shadow-2xl">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Add to your message
                </p>

                <button
                  type="button"
                  onClick={() => openFilePicker("files")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-200 hover:bg-white/10"
                >
                  <FileUp size={19} className="text-blue-400" />
                  <span>Upload files</span>
                </button>

                <button
                  type="button"
                  onClick={() => openFilePicker("photos")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-200 hover:bg-white/10"
                >
                  <Images size={19} className="text-green-400" />
                  <span>Photos</span>
                </button>

                <button
                  type="button"
                  onClick={() => openFilePicker("camera")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-200 hover:bg-white/10"
                >
                  <Camera size={19} className="text-orange-400" />
                  <span>Take a photo</span>
                </button>

                <div className="my-2 border-t border-white/10" />

                <button
                  type="button"
                  onClick={() => {
                    setThinkHarder((previous) => !previous);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/10 ${
                    thinkHarder
                      ? "text-purple-300"
                      : "text-gray-200"
                  }`}
                >
                  <BrainCircuit size={19} className="text-purple-400" />
                  <span>Think harder</span>
                  {thinkHarder && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImageMode((previous) => !previous);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/10 ${
                    imageMode
                      ? "text-blue-300"
                      : "text-gray-200"
                  }`}
                >
                  <ImagePlus size={19} className="text-blue-400" />
                  <span>Create image</span>
                  {imageMode && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </button>

                <div className="my-2 border-t border-white/10" />

                <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500">
                  <PlugZap size={19} />
                  <span>Plugins</span>
                  <span className="ml-auto rounded-full bg-white/10 px-2 py-1 text-[10px]">
                    Coming soon
                  </span>
                </div>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              resizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled || isGenerating}
            className="chat-composer-textarea max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-6 text-white outline-none placeholder:text-gray-500 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={listening ? stopVoiceRecording : startVoiceRecording}
            disabled={disabled || isGenerating}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              listening
                ? "animate-pulse bg-red-500 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
          >
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            type={isGenerating ? "button" : "submit"}
            onClick={isGenerating ? onStop : undefined}
            disabled={
              !isGenerating &&
              (disabled || (!message.trim() && attachments.length === 0))
            }
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              isGenerating
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
            }`}
            aria-label={isGenerating ? "Stop generating" : "Send message"}
          >
            {isGenerating ? <Square size={17} /> : <ArrowUp size={22} />}
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] text-gray-500">
          ZENTRIX AI can make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
}
