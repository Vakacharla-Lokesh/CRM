import React, { type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<GlobalErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("❌ Caught React error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>

            <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
              Something Went Wrong
            </h1>

            <p className="text-sm text-gray-600 text-center mb-6">
              An unexpected error occurred. Please try refreshing the page or
              contact support if the problem persists.
            </p>

            <div className="mb-6 bg-gray-100 rounded p-4 max-h-40 overflow-auto">
              <p className="text-xs font-mono text-gray-700 mb-2">
                {this.state.error.message}
              </p>
              {this.state.errorInfo && (
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer font-semibold">
                    Stack trace
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap wrap-break-word">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="flex-1"
              >
                Go Home
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Error ID: {Math.random().toString(36).substr(2, 9)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
