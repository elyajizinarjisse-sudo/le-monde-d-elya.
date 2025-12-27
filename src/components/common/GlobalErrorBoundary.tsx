import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
                    <h1 style={{ color: 'red' }}>💥 CRASH TOTAL DU SITE</h1>
                    <p>Voici l'erreur exacte qui empêche le site de s'afficher :</p>
                    <pre style={{
                        backgroundColor: '#ffeeee',
                        padding: '1rem',
                        borderRadius: '8px',
                        overflow: 'auto',
                        border: '2px solid red',
                        fontSize: '14px'
                    }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            fontSize: '1rem',
                            backgroundColor: '#333',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Rafraîchir la page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
