import React from "react";

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
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      try {
        window.history.pushState(null, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch (e) {
        window.location.href = "/";
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center text-white bg-black">
          <div className="max-w-md p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold font-display text-amber-400">
              {this.props.fallbackTitle || "Une interruption est survenue"}
            </h2>
            <p className="text-sm text-zinc-400">
              Une erreur inattendue est survenue lors de l'affichage. Vous pouvez réinitialiser pour revenir à l'accueil.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-transform active:scale-95 shadow-lg cursor-pointer"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

