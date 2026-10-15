"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  BarChart3,
  Boxes,
  Check,
  CircleHelp,
  Clock3,
  Copy,
  LayoutDashboard,
  MessageCircle,
  PackageSearch,
  ReceiptIndianRupee,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WandSparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AssistantResponse =
  | { data: { answer: string; generatedAt: string } }
  | { error: { code: string; message: string } };

const iconForSuggestion = [TrendingUp, Users, PackageSearch, ReceiptIndianRupee];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function CopilotIllustration() {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-white/15 bg-[#10121c] p-5 text-white shadow-2xl shadow-indigo-950/20 sm:min-h-[330px]">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full bg-indigo-500/35 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-8 top-10 w-[min(72%,235px)] rounded-2xl border border-white/15 bg-white/[0.09] p-4 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-400/20 text-indigo-200">
              <ReceiptIndianRupee size={17} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Business pulse</p>
              <p className="mt-1 text-xs font-semibold text-white/90">One clear next move</p>
            </div>
          </div>
          <Sparkles size={15} className="text-indigo-200" />
        </div>
        <div className="mb-4 flex items-end gap-2">
          <span className="text-3xl font-semibold tracking-tight">₹48.2k</span>
          <span className="mb-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-semibold text-emerald-200">+18.4%</span>
        </div>
        <div className="flex h-14 items-end gap-1.5">
          {[26, 36, 30, 46, 38, 54, 42, 62, 58, 72, 68, 82].map((height, index) => (
            <motion.span
              key={height + index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.04, duration: 0.6, ease: "easeOut" }}
              className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-400/35 to-indigo-200"
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 7, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute bottom-8 right-6 w-44 rounded-2xl border border-white/15 bg-[#1a1d2a]/90 p-3 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-300/15 text-amber-200">
            <Boxes size={15} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Attention</p>
            <p className="text-xs font-semibold text-white/85">3 items to restock</p>
          </div>
        </div>
        <div className="space-y-2">
          {["USB-C Cable", "Screen Guard", "Power Adapter"].map((item, index) => (
            <div key={item} className="flex items-center justify-between text-[10px] text-white/65">
              <span className="truncate">{item}</span>
              <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-white/80">{index + 2} left</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="absolute bottom-7 left-7 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-medium text-white/65 backdrop-blur-md">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
        <span>Read-only business intelligence</span>
      </div>
    </div>
  );
}

function MessageBubble({ message, onCopy }: { message: ChatMessage; onCopy: (content: string) => void }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
          <WandSparkles size={16} />
        </div>
      )}
      <div className={`group max-w-[min(88%,680px)] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-md bg-[var(--foreground)] px-4 py-3 text-sm leading-6 text-[var(--background)] shadow-sm"
              : "rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm leading-6 text-[var(--foreground)]"
          }
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {!isUser && (
          <button
            type="button"
            onClick={() => onCopy(message.content)}
            className="mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[var(--foreground)]/40 opacity-0 transition-opacity hover:text-[var(--foreground)] group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Copy answer"
          >
            <Copy size={11} /> Copy
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AssistantPage() {
  const t = useTranslations("Assistant");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "welcome", role: "assistant", content: t("welcomeMessage") },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = useMemo(
    () => [
      { label: t("suggestionSales"), icon: iconForSuggestion[0] },
      { label: t("suggestionReceivables"), icon: iconForSuggestion[1] },
      { label: t("suggestionStock"), icon: iconForSuggestion[2] },
      { label: t("suggestionInvoices"), icon: iconForSuggestion[3] },
    ],
    [t],
  );

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) return;
    transcript.scrollTo({ top: transcript.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || status === "sending") return;

    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    const userMessage: ChatMessage = { id: makeId("user"), role: "user", content: message };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      let payload: AssistantResponse | null;
      try {
        payload = (await response.json()) as AssistantResponse | null;
      } catch {
        throw new Error(t("genericError"));
      }
      if (!response.ok || !payload || typeof payload !== "object" || !("data" in payload)) {
        const apiError = payload && "error" in payload ? payload.error.message : t("genericError");
        throw new Error(apiError);
      }

      setMessages((current) => [
        ...current,
        { id: makeId("assistant"), role: "assistant", content: payload.data.answer },
      ]);
      setStatus("idle");
    } catch (requestError) {
      setStatus("error");
      setError(requestError instanceof Error ? requestError.message : t("genericError"));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const resetConversation = () => {
    setMessages([{ id: "welcome", role: "assistant", content: t("welcomeMessage") }]);
    setInput("");
    setError(null);
    setStatus("idle");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-2 sm:space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.10] via-[var(--surface)] to-[var(--surface-elevated)] p-6 shadow-[var(--shadow-elevation)] sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-indigo-700 dark:text-indigo-300">
              <Sparkles size={13} /> {t("eyebrow")}
            </div>
            <h1 className="max-w-xl text-3xl font-semibold tracking-[-0.045em] text-[var(--foreground)] sm:text-5xl sm:leading-[1.05]">
              {t("titleLineOne")} <span className="text-indigo-600 dark:text-indigo-300">{t("titleLineTwo")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--foreground)]/65 sm:text-base">
              {t("subtitle")}
            </p>
          </div>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/75 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 text-[var(--foreground)]/55">
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">{t("dataBoundaryTitle")}</span>
              </div>
              <p className="text-xs leading-5 text-[var(--foreground)]/65">{t("dataBoundaryText")}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/75 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 text-[var(--foreground)]/55">
                <Clock3 size={16} className="text-indigo-600 dark:text-indigo-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">{t("freshnessTitle")}</span>
              </div>
              <p className="text-xs leading-5 text-[var(--foreground)]/65">{t("freshnessText")}</p>
            </div>
          </div>
        </div>
        <CopilotIllustration />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-elevation)]">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--foreground)] text-[var(--background)] shadow-sm">
                <MessageCircle size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">{t("chatTitle")}</h2>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> {t("online")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--foreground)]/50">{t("chatSubtitle")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetConversation}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]/65 transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] sm:self-auto"
            >
              <RotateCcw size={14} /> {t("newChat")}
            </button>
          </div>

          <div ref={transcriptRef} className="h-[420px] space-y-5 overflow-y-auto px-4 py-5 sm:h-[470px] sm:px-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onCopy={handleCopy} />
            ))}
            <AnimatePresence>
              {status === "sending" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                  aria-live="polite"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                    <WandSparkles size={16} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                        className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                      />
                    ))}
                    <span className="ml-1 text-xs text-[var(--foreground)]/45">{t("thinking")}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--surface-elevated)]/50 p-3 sm:p-4">
            {error && (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300" role="alert">
                <CircleHelp size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
                <button type="button" onClick={() => setError(null)} className="ml-auto font-semibold underline underline-offset-2">
                  {t("dismiss")}
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 1200))}
                onKeyDown={handleInputKeyDown}
                disabled={status === "sending"}
                rows={2}
                maxLength={1200}
                placeholder={t("inputPlaceholder")}
                aria-label={t("inputLabel")}
                className="glass-input min-h-[88px] w-full resize-none pr-14 text-sm leading-6"
              />
              <div className="absolute bottom-3 left-3 text-[10px] text-[var(--foreground)]/35">
                {input.length}/1200 · {t("enterToSend")}
              </div>
              <button
                type="submit"
                disabled={!input.trim() || status === "sending"}
                className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--foreground)] text-[var(--background)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={t("send")}
              >
                <ArrowUp size={17} />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-[var(--foreground)]/40">
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> {t("readOnlyLabel")}</span>
              <span>{copied ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300"><Check size={12} /> {t("copied")}</span> : t("privacyLabel")}</span>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-elevation)] sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--foreground)]/40">{t("promptEyebrow")}</p>
                <h3 className="mt-1 text-sm font-semibold text-[var(--foreground)]">{t("promptTitle")}</h3>
              </div>
              <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-300"><LayoutDashboard size={16} /></div>
            </div>
            <div className="space-y-2">
              {suggestions.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setInput(label);
                    requestAnimationFrame(() => inputRef.current?.focus());
                  }}
                  className="group flex w-full items-start gap-3 rounded-xl border border-transparent px-2.5 py-2.5 text-left text-xs leading-5 text-[var(--foreground)]/65 transition-colors hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                >
                  <Icon size={15} className="mt-0.5 shrink-0 text-indigo-600 transition-transform group-hover:scale-110 dark:text-indigo-300" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-[var(--foreground)]/55">
              <BarChart3 size={16} />
              <h3 className="text-xs font-bold uppercase tracking-[0.14em]">{t("capabilitiesTitle")}</h3>
            </div>
            <ul className="space-y-3 text-xs leading-5 text-[var(--foreground)]/60">
              <li className="flex gap-2"><TrendingUp size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300" /> {t("capabilitySales")}</li>
              <li className="flex gap-2"><Users size={14} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-300" /> {t("capabilityCustomers")}</li>
              <li className="flex gap-2"><PackageSearch size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" /> {t("capabilityStock")}</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
