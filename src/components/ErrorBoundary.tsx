import { Component, ErrorInfo, ReactNode } from "react";
import { handleAndDisplayError } from "../lib/errorHandling";

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with component context
    console.error(
      `Error in ${this.props.componentName || "unknown component"}:`,
      {
        error,
        errorInfo,
        timestamp: new Date().toISOString(),
      },
    );

    // Use our centralized error handling
    handleAndDisplayError({
      ...error,
      message: `${error.message} (in ${this.props.componentName || "unknown component"})`,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-lg font-medium text-red-800">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-red-700">
            We encountered an error in this section. Please try refreshing the
            page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
