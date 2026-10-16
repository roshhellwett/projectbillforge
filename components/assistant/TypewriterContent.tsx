"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Sparkles, Check, Copy } from "lucide-react";

interface TypewriterContentProps {
  content: string;
  isLatest: boolean;
  onCopy: (text: string) => void;
  onScrollRequest?: () => void;
}

/**
 * Safely parse inline markdown (bold, currency, inline code).
 * Gracefully handles incomplete markdown during typewriter streaming.
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  // If text has unclosed bold markdown (e.g. "**hello" without ending "**"), auto-close it for display
  let normalized = text;
  const boldMatches = normalized.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0) {
    normalized += "**";
  }

  // Regex to match **bold**, `code`, and currency ₹ amounts
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|₹[\d,]+(?:\.\d+)?)/g;
  const parts = normalized.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold text: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const innerText = part.slice(2, -2);
      // Check if bold contains a rupee amount
      if (innerText.includes("₹")) {
        return (
          <strong key={index} className="font-semibold text-emerald-600 dark:text-emerald-400">
            {innerText}
          </strong>
        );
      }
      return (
        <strong key={index} className="font-semibold text-[var(--foreground)]">
          {innerText}
        </strong>
      );
    }

    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="rounded bg-[var(--surface-subtle)] px-1.5 py-0.5 font-mono text-xs text-indigo-600 dark:text-indigo-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Currency values: ₹200, ₹10,864.50
    if (/^₹[\d,]+(?:\.\d+)?$/.test(part)) {
      return (
        <span
          key={index}
          className="font-semibold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight"
        >
          {part}
        </span>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Renders structured markdown blocks (headers, bullet lists, numbered lists, paragraphs).
 */
function MarkdownBlocks({ text }: { text: string }) {
  const blocks = useMemo(() => {
    const rawParagraphs = text.split(/\n\n+/);
    return rawParagraphs.map((para) => para.trim()).filter(Boolean);
  }, [text]);

  return (
    <div className="space-y-3 text-sm leading-6 text-[var(--foreground)]/90">
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        // Check if all or most lines are bullet list items (- or * or •)
        const isBulletList = lines.length > 0 && lines.every((line) => /^[-*•]\s+/.test(line));

        if (isBulletList) {
          return (
            <ul
              key={blockIndex}
              className="my-2 space-y-2 rounded-xl bg-[var(--surface)]/60 p-3 border border-[var(--border)]/60"
            >
              {lines.map((line, lineIndex) => {
                const itemContent = line.replace(/^[-*•]\s+/, "");
                return (
                  <li key={lineIndex} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                    <span className="flex-1">{renderInlineFormatting(itemContent)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if all lines are numbered list items (1. 2. 3.)
        const isNumberedList = lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line));

        if (isNumberedList) {
          return (
            <ol
              key={blockIndex}
              className="my-2 space-y-2 rounded-xl bg-[var(--surface)]/60 p-3 border border-[var(--border)]/60"
            >
              {lines.map((line, lineIndex) => {
                const numberMatch = line.match(/^(\d+)\.\s+/);
                const number = numberMatch ? numberMatch[1] : `${lineIndex + 1}`;
                const itemContent = line.replace(/^\d+\.\s+/, "");
                return (
                  <li key={lineIndex} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
                      {number}
                    </span>
                    <span className="flex-1 pt-0.5">{renderInlineFormatting(itemContent)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Check if single line heading (###, ##, #)
        if (block.startsWith("### ")) {
          return (
            <h4 key={blockIndex} className="mt-3 text-sm font-bold text-[var(--foreground)]">
              {renderInlineFormatting(block.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h3 key={blockIndex} className="mt-4 text-base font-bold text-[var(--foreground)]">
              {renderInlineFormatting(block.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        // Mixed block: check if contains internal single-newline bullet points
        const containsBullets = lines.some((l) => /^[-*•]\s+/.test(l));
        if (containsBullets) {
          const renderedLines: React.ReactNode[] = [];
          let currentList: string[] = [];

          const flushList = (key: string) => {
            if (currentList.length > 0) {
              renderedLines.push(
                <ul
                  key={key}
                  className="my-2 space-y-1.5 rounded-xl bg-[var(--surface)]/60 p-3 border border-[var(--border)]/60"
                >
                  {currentList.map((li, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                      <span className="flex-1">{renderInlineFormatting(li)}</span>
                    </li>
                  ))}
                </ul>,
              );
              currentList = [];
            }
          };

          lines.forEach((line, idx) => {
            if (/^[-*•]\s+/.test(line)) {
              currentList.push(line.replace(/^[-*•]\s+/, ""));
            } else {
              flushList(`list-${idx}`);
              renderedLines.push(
                <p key={`p-${idx}`} className="my-1.5">
                  {renderInlineFormatting(line)}
                </p>,
              );
            }
          });
          flushList("list-end");

          return <div key={blockIndex}>{renderedLines}</div>;
        }

        // Default paragraph
        return (
          <p key={blockIndex} className="break-words">
            {renderInlineFormatting(block)}
          </p>
        );
      })}
    </div>
  );
}

export function TypewriterContent({
  content,
  isLatest,
  onCopy,
  onScrollRequest,
}: TypewriterContentProps) {
  const [displayedText, setDisplayedText] = useState(() => (isLatest ? "" : content));
  const [isTyping, setIsTyping] = useState(() => isLatest);
  const [hasCopied, setHasCopied] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const charIndexRef = useRef(0);

  // Instant skip to end on click
  const handleSkip = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setDisplayedText(content);
    setIsTyping(false);
    onScrollRequest?.();
  }, [content, onScrollRequest]);

  useEffect(() => {
    // If not latest or user prefers reduced motion, show full text immediately
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isLatest || prefersReducedMotion) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    charIndexRef.current = 0;
    setDisplayedText("");
    setIsTyping(true);
    lastTickTimeRef.current = performance.now();

    const stepMs = 14; // Smooth ~70 chars per second
    const charsPerStep = 2; // Stream 2 chars per tick

    const tick = (now: number) => {
      const elapsed = now - lastTickTimeRef.current;

      if (elapsed >= stepMs) {
        lastTickTimeRef.current = now;
        charIndexRef.current = Math.min(content.length, charIndexRef.current + charsPerStep);
        setDisplayedText(content.slice(0, charIndexRef.current));
        onScrollRequest?.();

        if (charIndexRef.current >= content.length) {
          setIsTyping(false);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [content, isLatest, onScrollRequest]);

  const handleCopyClick = () => {
    onCopy(content);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div
      onClick={isTyping ? handleSkip : undefined}
      className={`group relative rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--surface-elevated)] p-4 sm:p-5 shadow-sm transition-all ${
        isTyping ? "cursor-pointer" : ""
      }`}
    >
      {/* Header Eyebrow */}
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--border)]/50 pb-2 text-[11px] text-[var(--foreground)]/50">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
          <Sparkles size={13} className="shrink-0 animate-pulse" />
          <span>BillForge Copilot</span>
        </div>
        {isTyping && (
          <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70 animate-pulse">
            typing... (click to skip)
          </span>
        )}
      </div>

      {/* Structured Content with Typewriter */}
      <div className="relative">
        <MarkdownBlocks text={displayedText} />
        {isTyping && (
          <span
            className="inline-block h-4 w-1.5 ml-1 align-middle rounded-sm bg-indigo-600 dark:bg-indigo-400 animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Footer Actions (Copy Button) */}
      {!isTyping && (
        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)]/40 pt-2 text-[10px] text-[var(--foreground)]/45">
          <span className="text-[10px] text-[var(--foreground)]/40">
            Verified workspace context
          </span>
          <button
            type="button"
            onClick={handleCopyClick}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]/70 transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            title="Copy response"
          >
            {hasCopied ? (
              <>
                <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Copied!
                </span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
