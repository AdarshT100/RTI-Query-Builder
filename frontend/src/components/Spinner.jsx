import './Spinner.css'

export default function Spinner({ message }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner-ring" aria-hidden="true" />
      {message && (
        <p className="spinner-message">{message}</p>
      )}
    </div>
  )
}