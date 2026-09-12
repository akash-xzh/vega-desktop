import { Component, type ErrorInfo, type ReactNode } from "react";
import { LuTriangleAlert, LuRefreshCw, LuHouse } from "react-icons/lu";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100vw",
            backgroundColor: "var(--background, #121212)",
            color: "var(--foreground, #ffffff)",
            padding: "24px",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <LuTriangleAlert size={56} style={{ color: "#ef4444", marginBottom: "16px" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "8px" }}>
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--muted-foreground, #a1a1aa)",
              maxWidth: "500px",
              marginBottom: "24px",
              wordBreak: "break-word",
            }}
          >
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={this.handleReload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "var(--primary, #3b82f6)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <LuRefreshCw size={16} />
              Reload App
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <LuHouse size={16} />
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
