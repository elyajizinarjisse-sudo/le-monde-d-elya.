import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl m-4">
                    <h2 className="text-xl font-bold text-red-700 mb-2">Oups, une erreur est survenue ! 🐛</h2>
                    <p className="text-red-600 mb-4">Le composant n'a pas pu s'afficher correctement.</p>
                    <details className="whitespace-pre-wrap text-sm text-red-800 bg-red-100 p-4 rounded-lg overflow-auto max-h-96">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Rafraîchir la page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
