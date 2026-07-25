"use client";

import { useEffect } from "react";
import ErrorFallback from "@/components/ErrorFallback";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return <ErrorFallback error={error} reset={reset} />;
}
