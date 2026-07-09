"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface FallbackProps {
  error: Error;
  reset: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error);
    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const reset = this.handleReset;

      if (typeof fallback === "function") {
        return (fallback as (props: FallbackProps) => ReactNode)({ error: this.state.error!, reset });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-danger/10 grid place-items-center mx-auto mb-4">
              <span className="text-danger text-xl font-bold">!</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">
              Something went wrong
            </h2>
            <p className="text-sm text-text-light mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary/90"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
