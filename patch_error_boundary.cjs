const fs = require('fs');
const content = `import React from "react";

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ERROR BOUNDARY CATCH]", error, errorInfo);
    
    // Auto-reset logic
    if (typeof window !== 'undefined') {
      const resetCount = parseInt(sessionStorage.getItem('error_boundary_reset_count') || '0', 10);
      if (resetCount < 2) {
        sessionStorage.setItem('error_boundary_reset_count', String(resetCount + 1));
        localStorage.clear();
        if (this.props.onReset) {
            this.props.onReset();
        } else {
            window.location.hash = "";
            window.location.pathname = "/";
        }
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // We don't want to show the French error screen.
      // Show a simple loading indicator while the page reloads.
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
        </div>
      );
    }
    return this.props.children;
  }
}
`;
fs.writeFileSync('src/components/ErrorBoundary.tsx', content);
console.log("Patched ErrorBoundary to auto-reset instead of showing UI.");
