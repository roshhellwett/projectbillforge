"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  BarChart3,
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
import {
  ASSISTANT_MAX_HISTORY_MESSAGE_LENGTH,
  ASSISTANT_MAX_MESSAGE_LENGTH,
  boundAssistantHistory,
  parseAssistantReadinessResponse,
  parseAssistantResponse,
  type AssistantReadinessData,
} from "@/lib/ai/assistant-contract";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type HistoryMessage = Pick<ChatMessage, "role" | "content">;

type FailedRequest = {
  message: string;
  history: HistoryMessage[];
};

type ReadinessState =
  | "unknown"
  | "checking"
  | "configured"
  | "empty"
  | "not_configured"
  | "provider_auth_error"
  | "unauthorized"
  | "data_unavailable"
  | "provider_unavailable"
  | "responded";

class AssistantRequestFailure extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
    this.name = "AssistantRequestFailure";
  }
}

const iconForSuggestion = [TrendingUp, Users, PackageSearch, ReceiptIndianRupee];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readinessStateFromData(data: AssistantReadinessData): ReadinessState {
  if (data.provider === "not_configured") return "not_configured";
  if (data.provider === "unknown") return "unknown";
  if (data.data === "unavailable") return "data_unavailable";
  if (data.data === "empty") return "empty";
  if (data.provider === "configured" && data.data === "available") return "configured";
  return "unknown";
}

function CopilotIllustration() {
  const t = useTranslations("Assistant");
  const flowLabels = [
    t("illustrationQuestion"),
    t("illustrationContext"),
    t("illustrationAnswer"),
  ];

  return (
    <div
      role="img"
      aria-label={t("illustrationAriaLabel")}
      className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-white/15 bg-[#10121c] p-5 text-white shadow-2xl shadow-indigo-950/20 sm:min-h-[330px]"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full bg-indigo-500/35 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-8 top-10 w-[min(86%,330px)] rounded-2xl border border-white/15 bg-white/[0.09] p-4 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-400/20 text-indigo-200">
              <MessageCircle size={17} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{t("illustrationLabel")}</p>
              <p className="mt-1 text-xs font-semibold text-white/90">{t("illustrationTitle")}</p>
            </div>
          </div>
          <Sparkles size={15} className="text-indigo-200" />
        </div>
        <div className="relative flex items-start justify-between gap-2">
          <div className="absolute inset-x-8 top-4 h-px bg-white/15" />
          {flowLabels.map((label) => (
            <div key={label} className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200/40 bg-indigo-300/15">
                <span className="h-2 w-2 rounded-full bg-indigo-100" />
              </span>
              <span className="text-[10px] font-medium leading-4 text-white/65">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 7, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute bottom-8 right-6 w-48 rounded-2xl border border-white/15 bg-[#1a1d2a]/90 p-3 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-200">
            <ShieldCheck size={15} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{t("illustrationBoundaryTitle")}</p>
            <p className="mt-1 text-xs leading-5 text-white/70">{t("illustrationBoundaryText")}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-1.5 opacity-70" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className="h-1.5 rounded-full bg-white/20" />
          ))}
        </div>
      </motion.div>

      <div className="absolute bottom-7 left-7 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-medium text-white/65 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
        <span>{t("illustrationNoData")}</span>
      </div>
    </div>
  );
}

function MessageBubble({ message, onCopy }: { message: ChatMessage; onCopy: (content: string) => void }) {
  const t = useTranslations("Assistant");
  const isUser = message.role === "user";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      aria-label={t(isUser ? "userMessageLabel" : "assistantMessageLabel")}
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
            aria-label={t("copyAnswer")}
          >
            <Copy size={11} /> {t("copy")}
          </button>
        )}
      </div>
    </motion.article>
  );
}

export default function AssistantPage() {
  const t = useTranslations("Assistant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [failedRequest, setFailedRequest] = useState<FailedRequest | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessState>("unknown");
  const [readinessCheckedAt, setReadinessCheckedAt] = useState<string | null>(null);
  const [lastContextAt, setLastContextAt] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const conversationVersionRef = useRef(0);
  const mountedRef = useRef(true);

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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    transcript.scrollTo({ top: transcript.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, status]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setReadiness("checking");

    void fetch("/api/ai/assistant", {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        let payload: unknown = null;
        try {
          payload = await response.json();
        } catch {
          throw new Error("Invalid readiness response");
        }

        const data = parseAssistantReadinessResponse(payload);
        if (!response.ok) {
          if (response.status === 401 && !cancelled) {
            setReadiness("unauthorized");
            setReadinessCheckedAt(null);
            return;
          }
          throw new Error("Readiness unavailable");
        }
        if (!data) throw new Error("Readiness unavailable");
        if (!cancelled) {
          setReadiness(readinessStateFromData(data));
          setReadinessCheckedAt(data.checkedAt);
        }
      })
      .catch((readinessError) => {
        if (!cancelled && !(readinessError instanceof DOMException && readinessError.name === "AbortError")) {
          setReadiness("unknown");
          setReadinessCheckedAt(null);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      requestControllerRef.current?.abort();
    };
  }, []);

  const handleCopy = async (content: string) => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setCopyError(true);
      window.setTimeout(() => setCopyError(false), 2_500);
    }
  };

  const readinessLabel = {
    unknown: t("readinessUnknown"),
    checking: t("readinessChecking"),
    configured: t("readinessConfigured"),
    empty: t("readinessEmpty"),
    not_configured: t("readinessNotConfigured"),
    provider_auth_error: t("readinessProviderAuth"),
    unauthorized: t("readinessUnauthorized"),
    data_unavailable: t("readinessDataUnavailable"),
    provider_unavailable: t("readinessProviderUnavailable"),
    responded: t("readinessResponded"),
  }[readiness];

  const readinessTone = {
    unknown: "bg-amber-500/70",
    checking: "bg-amber-500 animate-pulse",
    configured: "bg-indigo-500",
    empty: "bg-sky-500",
    not_configured: "bg-rose-500",
    provider_auth_error: "bg-rose-500",
    unauthorized: "bg-amber-500",
    data_unavailable: "bg-rose-500",
    provider_unavailable: "bg-rose-500",
    responded: "bg-emerald-500",
  }[readiness];

  const getErrorMessage = (code: string | undefined, fallback: string) => {
    switch (code) {
      case "AI_NOT_CONFIGURED":
        return t("errorNotConfigured");
      case "AI_DATA_UNAVAILABLE":
        return t("errorDataUnavailable");
      case "AI_RATE_LIMITED":
        return t("errorRateLimited");
      case "AI_TIMEOUT":
        return t("errorTimeout");
      case "AI_UPSTREAM_ERROR":
        return t("errorProviderUnavailable");
      case "AI_NETWORK_ERROR":
        return t("errorNetwork");
      case "AI_PROVIDER_AUTH":
        return t("errorProviderAuth");
      case "AI_PROVIDER_RATE_LIMITED":
        return t("errorProviderRateLimited");
      case "AI_INVALID_RESPONSE":
        return t("errorInvalidResponse");
      case "UNAUTHORIZED":
        return t("errorUnauthorized");
      case "VALIDATION_ERROR":
        return t("errorValidation");
      case "PAYLOAD_TOO_LARGE":
        return t("errorPayloadTooLarge");
      case "INTERNAL_ERROR":
        return t("errorInternal");
      default:
        return fallback.trim() || t("genericError");
    }
  };

  const updateReadinessFromError = (code?: string) => {
    if (code === "UNAUTHORIZED") {
      setReadiness("unauthorized");
    } else if (code === "AI_NOT_CONFIGURED") {
      setReadiness("not_configured");
    } else if (code === "AI_PROVIDER_AUTH") {
      setReadiness("provider_auth_error");
    } else if (code === "AI_DATA_UNAVAILABLE") {
      setReadiness("data_unavailable");
    } else if (
      code === "AI_UPSTREAM_ERROR" ||
      code === "AI_PROVIDER_RATE_LIMITED" ||
      code === "AI_NETWORK_ERROR" ||
      code === "AI_TIMEOUT" ||
      code === "AI_INVALID_RESPONSE"
    ) {
      setReadiness("provider_unavailable");
    }
  };

  const sendMessage = async (
    rawMessage: string,
    options: { retry?: boolean; history?: HistoryMessage[] } = {},
  ) => {
    const message = rawMessage.trim().slice(0, ASSISTANT_MAX_MESSAGE_LENGTH);
    if (!message || status === "sending") return;

    const history = boundAssistantHistory(
      options.history ?? messages.map(({ role, content }) => ({ role, content })),
    ).map(({ role, content }) => ({
      role,
      content: content.slice(0, ASSISTANT_MAX_HISTORY_MESSAGE_LENGTH),
    }));

    if (!options.retry) {
      const userMessage: ChatMessage = { id: makeId("user"), role: "user", content: message };
      setMessages((current) => [...current, userMessage]);
      setFailedRequest(null);
    }
    setInput("");
    setStatus("sending");
    setError(null);

    const controller = new AbortController();
    const conversationVersion = conversationVersionRef.current;
    requestControllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
        cache: "no-store",
      });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new AssistantRequestFailure(t("errorInvalidResponse"), "AI_INVALID_RESPONSE");
      }

      const parsedPayload = parseAssistantResponse(payload);
      if (!response.ok || parsedPayload.kind !== "success") {
        if (parsedPayload.kind === "error") {
          throw new AssistantRequestFailure(
            getErrorMessage(parsedPayload.error.code, parsedPayload.error.message),
            parsedPayload.error.code,
          );
        }
        throw new AssistantRequestFailure(t("errorInvalidResponse"), "AI_INVALID_RESPONSE");
      }

      if (!mountedRef.current || conversationVersion !== conversationVersionRef.current) return;

      setMessages((current) => [
        ...current,
        { id: makeId("assistant"), role: "assistant", content: parsedPayload.data.answer },
      ]);
      setLastContextAt(parsedPayload.data.generatedAt);
      setReadinessCheckedAt(parsedPayload.data.generatedAt);
      setReadiness(parsedPayload.data.scope?.context === "empty" ? "empty" : "responded");
      setFailedRequest(null);
      setStatus("idle");
    } catch (requestError) {
      if (!mountedRef.current || conversationVersion !== conversationVersionRef.current) return;
      let failure: AssistantRequestFailure;
      if (requestError instanceof AssistantRequestFailure) {
        failure = requestError;
      } else if (requestError instanceof DOMException && requestError.name === "AbortError") {
        failure = new AssistantRequestFailure(t("errorTimeout"), "AI_TIMEOUT");
      } else if (requestError instanceof TypeError) {
        failure = new AssistantRequestFailure(t("errorNetwork"), "AI_NETWORK_ERROR");
      } else {
        failure = new AssistantRequestFailure(t("genericError"));
      }
      setStatus("error");
      setFailedRequest({ message, history });
      setError(failure.message);
      updateReadinessFromError(failure.code);
    } finally {
      window.clearTimeout(timeout);
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
    }
  };

  const retryFailedQuestion = () => {
    if (!failedRequest || status === "sending") return;
    void sendMessage(failedRequest.message, {
      retry: true,
      history: failedRequest.history,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const resetConversation = () => {
    conversationVersionRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setMessages([]);
    setInput("");
    setError(null);
    setFailedRequest(null);
    setStatus("idle");
    setLastContextAt(null);
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
                  <span
                    className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1 text-[10px] font-semibold text-[var(--foreground)]/55"
                    aria-live="polite"
                    title={readinessCheckedAt ?? undefined}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${readinessTone}`} /> {readinessLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--foreground)]/50">
                  {t("chatSubtitle")} {lastContextAt ? t("lastAnswerFreshness") : ""}
                </p>
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

          <div
            ref={transcriptRef}
            className="h-[420px] space-y-5 overflow-y-auto px-4 py-5 sm:h-[470px] sm:px-6"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label={t("transcriptLabel")}
            aria-busy={status === "sending"}
          >
            {messages.length === 0 && status !== "sending" && (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center" role="status">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                  <MessageCircle size={20} />
                </div>
                <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">{t("emptyStateTitle")}</p>
                <p className="mt-2 max-w-sm text-xs leading-5 text-[var(--foreground)]/55">{t("emptyStateText")}</p>
              </div>
            )}
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
                  role="status"
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
                <div className="min-w-0 flex-1">
                  <p>{error}</p>
                  {messages.some((message) => message.role === "assistant") && (
                    <p className="mt-1 text-[10px] opacity-80">{t("staleAnswerNotice")}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {failedRequest && (
                    <button
                      type="button"
                      onClick={retryFailedQuestion}
                      disabled={status === "sending"}
                      className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw size={12} /> {t("retry")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setFailedRequest(null);
                    }}
                    className="font-semibold underline underline-offset-2"
                  >
                    {t("dismiss")}
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative" aria-label={t("chatFormLabel")}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, ASSISTANT_MAX_MESSAGE_LENGTH))}
                onKeyDown={handleInputKeyDown}
                disabled={status === "sending"}
                rows={2}
                maxLength={ASSISTANT_MAX_MESSAGE_LENGTH}
                placeholder={t("inputPlaceholder")}
                aria-label={t("inputLabel")}
                aria-describedby="assistant-input-help assistant-input-count"
                aria-keyshortcuts="Enter"
                className="glass-input min-h-[88px] w-full resize-none pr-14 text-sm leading-6"
              />
              <div id="assistant-input-count" className="absolute bottom-3 left-3 text-[10px] text-[var(--foreground)]/35" aria-live="polite">
                {input.length}/{ASSISTANT_MAX_MESSAGE_LENGTH}
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
            <p id="assistant-input-help" className="mt-2 text-[10px] text-[var(--foreground)]/40">{t("enterToSend")}</p>
            <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-[var(--foreground)]/40">
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> {t("readOnlyLabel")}</span>
              <span aria-live="polite">{copied ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300"><Check size={12} /> {t("copied")}</span> : copyError ? <span className="text-[var(--color-danger)]">{t("copyFailed")}</span> : t("privacyLabel")}</span>
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
