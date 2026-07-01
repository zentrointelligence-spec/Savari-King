import { Component } from "react";

// Isolates render crashes so one broken section can't blank the whole page.
// In dev, the fallback prints the error + stack so the failing component is
// obvious; in production it shows a quiet, non-fatal placeholder.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(`[ErrorBoundary:${this.props.name || "section"}]`, error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (import.meta.env.DEV) {
        return (
          <div
            style={{
              margin: "24px auto",
              maxWidth: 960,
              padding: 24,
              border: "1px solid #e5b567",
              background: "#fff8ec",
              color: "#5a3b00",
              borderRadius: 12,
              fontFamily: "ui-monospace, monospace",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>⚠️ {this.props.name || "Section"} failed to render.</strong>
            {"\n\n"}
            {this.state.error?.message || String(this.state.error)}
            {"\n\n"}
            <button
              onClick={this.reset}
              style={{
                marginTop: 8,
                padding: "6px 12px",
                border: "1px solid #c79a3a",
                background: "#fff",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        );
      }
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
