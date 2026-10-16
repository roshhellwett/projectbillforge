"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "./ui";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("[billforge] ErrorBoundary caught:", error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorState
          description="This section could not load. Your data is safe; try again."
          onRetry={() => this.setState({ hasError: false, error: undefined })}
          retryLabel="Try again"
        />
      );
    }
    return this.props.children;
  }
}
