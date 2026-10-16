"use client";

import { Package, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  visible: boolean;
  filtered: boolean;
  onClear: () => void;
  onCreate: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMoreError?: string | null;
  remaining?: number;
  loaded?: number;
  total?: number;
  onLoadMore?: () => void;
}

export function EmptyState({ visible, filtered, onClear, onCreate, hasMore = false, loadingMore = false, loadMoreError, remaining = 0, loaded = 0, total = 0, onLoadMore }: Props) {
  const t = useTranslations("Products");
  if (!visible) return null;

  return (
    <div className="p-10 sm:p-16 text-center flex flex-col items-center">
      {filtered ? (
        <SearchX size={40} className="mb-3 text-[var(--foreground)]/20" aria-hidden="true" />
      ) : (
        <Package size={40} className="mb-3 text-[var(--foreground)]/20" aria-hidden="true" />
      )}
      <p className="text-[var(--foreground)] font-semibold">
        {filtered ? t("noSearchResults") : t("noProducts")}
      </p>
      <p className="mt-1 max-w-sm text-sm text-[var(--foreground)]/55">
        {filtered ? t("noSearchResultsHint") : t("emptyHint")}
      </p>
      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        {filtered && (
          <button type="button" onClick={onClear} className="glass-btn-secondary min-h-[44px]">
            {t("clearSearch")}
          </button>
        )}
        {!filtered && (
          <button type="button" onClick={onCreate} className="glass-btn-primary min-h-[44px]">
            {t("createFirstProduct")}
          </button>
        )}
      </div>
      {hasMore && onLoadMore && (
        <div className="mt-5 pt-5 border-t border-[var(--border)] w-full max-w-sm flex flex-col items-center gap-2">
          {loadMoreError && <p className="text-sm text-[var(--foreground)]/70" role="alert">{loadMoreError}</p>}
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="glass-btn-secondary min-h-[44px]"
            aria-busy={loadingMore}
          >
            {loadingMore ? t("loadingMore") : loadMoreError ? t("retryLoadMore") : t("loadMoreRemaining", { remaining })}
          </button>
          <p className="text-xs text-[var(--foreground)]/50" aria-live="polite">
            {t("paginationFeedback", { loaded: Math.min(loaded, total), total })}
          </p>
        </div>
      )}
    </div>
  );
}
