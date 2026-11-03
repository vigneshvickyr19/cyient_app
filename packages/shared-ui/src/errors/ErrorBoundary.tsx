import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '../components/ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Rendered instead of the default page; `reset` tries the children again. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** When any of these change (for example the page address), a shown error is cleared. */
  resetKeys?: readonly unknown[];
}

interface ErrorBoundaryState {
  error: Error | null;
  resetKeys: readonly unknown[] | undefined;
}

/** Catches an unexpected rendering error so one broken page doesn't blank the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null, resetKeys: this.props.resetKeys };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    const changed =
      props.resetKeys?.length !== state.resetKeys?.length || (props.resetKeys ?? []).some((key, i) => !Object.is(key, state.resetKeys?.[i]));
    return changed ? { error: null, resetKeys: props.resetKeys } : null;
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unexpected rendering error', error, info.componentStack);
  }

  private readonly reset = () => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return (
      <ErrorState
        title="This page ran into a problem"
        message="Something unexpected happened while showing this page. Try again, or reload the app."
        onRetry={this.reset}
      />
    );
  }
}
