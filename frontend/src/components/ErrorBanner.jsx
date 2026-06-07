import './ErrorBanner.css'

export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      <p className="error-banner__message">{message}</p>
      <button
        className="error-banner__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        Dismiss
      </button>
    </div>
  )
}