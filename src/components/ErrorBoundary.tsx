import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { failed: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="crash">
        <h1>მუზეუმი წამით გაჩერდა</h1>
        <p>გვერდის განახლება სცადე. თუ იგივე განმეორდა, მასწავლებელს ბრაუზერის კონსოლი აჩვენე.</p>
        <button type="button" onClick={() => window.location.reload()}>განახლება</button>
      </div>
    );
  }
}
