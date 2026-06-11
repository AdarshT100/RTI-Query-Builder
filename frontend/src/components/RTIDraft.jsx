    import { useState } from "react";
    import './RTIDraft.css'

    export default function RTIDraft({ rtiDraft, skeleton = false }) {
    const [editedDraft, setEditedDraft] = useState(() => {
        if (skeleton) return null;
        return {
        ...rtiDraft,
        requests: [...rtiDraft.requests],
        _date: '',
        _applicantName: '[Applicant Name]',
        _applicantAddress: '[Applicant Address]',
        _applicantContact: '[Applicant Contact]',
        };
    });

    const [showPlaceholderWarning, setShowPlaceholderWarning] = useState(false);

    function handleFieldChange(field, value) {
        setEditedDraft(prev => ({ ...prev, [field]: value }));
    }

    function handleRequestChange(index, value) {
        setEditedDraft(prev => {
        const updated = [...prev.requests];
        updated[index] = value;
        return { ...prev, requests: updated };
        });
    }

    function handleDownload() {
        const fieldsToCheck = [
        editedDraft.addressee,
        editedDraft.subject,
        ...editedDraft.requests,
        editedDraft._date,
        editedDraft._applicantName,
        editedDraft._applicantAddress,
        editedDraft._applicantContact,
        ];
        const hasUnfilled = fieldsToCheck.some(v => typeof v === 'string' && v.includes('['));
        if (hasUnfilled) {
        setShowPlaceholderWarning(true);
        return;
        }
        console.log("[download] no unfilled placeholders — would generate PDF");
    }

    function handleDownloadAnyway() {
        setShowPlaceholderWarning(false);
        console.log("[download] proceeding despite unfilled placeholders — would generate PDF");
    }

    if (skeleton) {
        return (
        <div className="rti-draft">
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--title" aria-hidden="true" />

            <div className="rti-draft__section">
            <div className="rti-draft__skeleton-label" aria-hidden="true" />
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--addressee" aria-hidden="true" />
            </div>

            <div className="rti-draft__section">
            <div className="rti-draft__skeleton-label" aria-hidden="true" />
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--subject" aria-hidden="true" />
            </div>

            <div className="rti-draft__section">
            <div className="rti-draft__skeleton-label" aria-hidden="true" />
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--request" aria-hidden="true" />
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--request" aria-hidden="true" />
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--request" aria-hidden="true" />
            </div>

            <div className="rti-draft__section rti-draft__section--signature">
            <div className="rti-draft__skeleton-label" aria-hidden="true" />
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--sig" aria-hidden="true" />
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--sig" aria-hidden="true" />
            <div className="rti-draft__skeleton-block rti-draft__skeleton-block--sig" aria-hidden="true" />
            </div>

            <p className="rti-draft__skeleton-message" role="status" aria-live="polite">
            Generating your RTI application…
            </p>
        </div>
        );
    }

    const authorityConfidence = editedDraft.authority_confidence;

    return (
        <div className="rti-draft">
        <h2 className="rti-draft__heading">Your RTI Application</h2>
        <p className="rti-draft__subheading">
            Review and edit any field before downloading. Fill in the highlighted placeholders with your personal details.
        </p>

        {editedDraft.scope_note && (
            <div className="rti-draft__scope-note" role="note">
            <span className="rti-draft__scope-note-label">Scope note</span>
            {editedDraft.scope_note}
            </div>
        )}

        <div className="rti-draft__section">
            <label className="rti-draft__label" htmlFor="rti-addressee">
            To
            </label>

            {authorityConfidence === 'uncertain' && (
            <div className="rti-draft__authority-warning" role="note">
                <span className="rti-draft__authority-warning-icon" aria-hidden="true">⚠</span>
                Please verify this authority before submitting — we couldn't confirm it with certainty.
            </div>
            )}

            {authorityConfidence === 'unknown' && (
            <div className="rti-draft__authority-prompt" role="note">
                The correct authority could not be determined. Please fill in the authority details below before submitting.
            </div>
            )}

            <textarea
            id="rti-addressee"
            className={[
                'rti-draft__textarea',
                authorityConfidence === 'unknown' ? 'rti-draft__textarea--authority-unknown' : ''
            ].join(' ').trim()}
            value={editedDraft.addressee}
            onChange={e => handleFieldChange('addressee', e.target.value)}
            rows={4}
            placeholder={authorityConfidence === 'unknown'
                ? 'Enter: The Public Information Officer, [Department Name], [Office Address]'
                : undefined
            }
            />
        </div>

        <div className="rti-draft__section">
            <label className="rti-draft__label" htmlFor="rti-subject">
            Subject
            </label>
            <input
            id="rti-subject"
            type="text"
            className="rti-draft__input"
            value={editedDraft.subject}
            onChange={e => handleFieldChange('subject', e.target.value)}
            />
        </div>

        <div className="rti-draft__section">
            <p className="rti-draft__label">Information Requested</p>
            <div className="rti-draft__requests">
            {editedDraft.requests.map((req, i) => (
                <div key={i} className="rti-draft__request-item">
                <span className="rti-draft__request-number">{i + 1}.</span>
                <textarea
                    id={`rti-request-${i}`}
                    className="rti-draft__textarea rti-draft__textarea--request"
                    value={req}
                    onChange={e => handleRequestChange(i, e.target.value)}
                    rows={3}
                    aria-label={`Request item ${i + 1}`}
                />
                </div>
            ))}
            </div>
        </div>

        <div className="rti-draft__section rti-draft__section--signature">
            <p className="rti-draft__label">Signature Block</p>

            <div className="rti-draft__sig-row">
            <label className="rti-draft__sig-label" htmlFor="rti-date">Date</label>
            <input
                id="rti-date"
                type="text"
                className="rti-draft__input rti-draft__input--sig"
                value={editedDraft._date}
                onChange={e => handleFieldChange('_date', e.target.value)}
                placeholder="e.g. 11 June 2026"
            />
            </div>

            <div className="rti-draft__sig-row">
            <label className="rti-draft__sig-label" htmlFor="rti-name">Applicant Name</label>
            <input
                id="rti-name"
                type="text"
                className="rti-draft__input rti-draft__input--sig"
                value={editedDraft._applicantName}
                onChange={e => handleFieldChange('_applicantName', e.target.value)}
            />
            </div>

            <div className="rti-draft__sig-row">
            <label className="rti-draft__sig-label" htmlFor="rti-contact">Contact</label>
            <input
                id="rti-contact"
                type="text"
                className="rti-draft__input rti-draft__input--sig"
                value={editedDraft._applicantContact}
                onChange={e => handleFieldChange('_applicantContact', e.target.value)}
            />
            </div>

            <div className="rti-draft__sig-row">
            <label className="rti-draft__sig-label" htmlFor="rti-address">Address</label>
            <textarea
                id="rti-address"
                className="rti-draft__textarea rti-draft__textarea--sig"
                value={editedDraft._applicantAddress}
                onChange={e => handleFieldChange('_applicantAddress', e.target.value)}
                rows={2}
            />
            </div>
        </div>

        {showPlaceholderWarning && (
            <div className="rti-draft__placeholder-warning" role="alert">
            <p className="rti-draft__placeholder-warning-text">
                One or more placeholders are unfilled. You can still download, but review the highlighted fields before printing.
            </p>
            <div className="rti-draft__placeholder-warning-actions">
                <button
                className="rti-draft__btn rti-draft__btn--secondary"
                onClick={() => setShowPlaceholderWarning(false)}
                >
                Go back and fill in
                </button>
                <button
                className="rti-draft__btn rti-draft__btn--primary"
                onClick={handleDownloadAnyway}
                >
                Download anyway
                </button>
            </div>
            </div>
        )}

        <button
            className="rti-draft__btn rti-draft__btn--primary"
            onClick={handleDownload}
        >
            Download PDF
        </button>
        </div>
    );
    }