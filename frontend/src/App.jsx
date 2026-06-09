import { useRTIFlow } from "./hooks/useRTIFlow";
import Spinner from "./components/Spinner";
import ErrorBanner from "./components/ErrorBanner";
import ComplaintInput from "./components/ComplaintInput";
import ClarifyingQuestions from "./components/ClarifyingQuestions";
import "./App.css";

export default function App() {
  const {
    stage,
    questions,
    languageNote,
    isLoading,
    error,
    handleReset,
    handleErrorDismiss,
    handleComplaintSubmit,
    handleAnswersSubmit
  } = useRTIFlow();

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-header__name">RTI Query Builder</span>
          <span className="app-header__tagline">Your complaint. Their obligation.</span>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <ErrorBanner message={error} onDismiss={handleErrorDismiss} />
        )}

        {isLoading ? (
          <Spinner message={
            stage === "input" || stage === "questions"
              ? "Analyzing your complaint…"
              : "Generating your RTI application…"
          } />
        ) : (
          <>
            {stage === "input" && (
              <ComplaintInput onSubmit={handleComplaintSubmit}/>
            )}
            {stage === "questions" && (
              <ClarifyingQuestions
                questions={questions}
                languageNote={languageNote}
                onAnswersSubmit={handleAnswersSubmit}
              />
            )}
            {stage === "draft" && (
              <div className="stage-placeholder">Stage: RTI Draft</div>
            )}
            {stage === "non_rti_able" && (
              <div className="stage-placeholder">Stage: Non-RTI-able Exit</div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p className="app-footer__privacy">
          No accounts. No data logging. Your information is wiped the moment your download completes.
        </p>
      </footer>
    </div>
  );
}