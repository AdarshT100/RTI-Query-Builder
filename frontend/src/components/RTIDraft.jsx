    import { useState } from "react";
    import { jsPDF } from "jspdf";
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

    // PDF generation
    function checkAndAddPage(doc, currentY) {
        const pageHeight = doc.internal.pageSize.getHeight();
        const bottomMargin = 25;
        if (currentY > pageHeight - bottomMargin) {
        doc.addPage();
        return 25;
        }
        return currentY;
    }

    function generatePDF(draft) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const leftMargin = 25;
    const printableWidth = 160;
    const lineHeightBody = 12 * 0.3528 * 1.5;
    const lineHeightTight = 12 * 0.3528 * 1.2;
    const PLACEHOLDER_TOKENS = ['[Applicant Name]', '[Applicant Address]', '[Applicant Contact]'];
    let currentY = 25;

    // Helper: render a personal field value with correct weight
    function renderPersonalField(value, x, y) {
        if (PLACEHOLDER_TOKENS.includes(value)) {
        doc.setFont('times', 'bold');
        doc.text(value, x, y);
        doc.setFont('times', 'normal');
        } else {
        doc.setFont('times', 'normal');
        doc.text(value, x, y);
        }
    }

    // Section 1: Document title
    currentY = checkAndAddPage(doc, currentY);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    const title = 'APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005';
    const titleLines = doc.splitTextToSize(title, printableWidth);
    doc.text(titleLines, 105, currentY, { align: 'center' });
    currentY += titleLines.length * (13 * 0.3528 * 1.5);
    currentY += lineHeightBody;

    // Section 2: Addressee block
    currentY = checkAndAddPage(doc, currentY);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('To,', leftMargin, currentY);
    currentY += lineHeightTight;

    currentY = checkAndAddPage(doc, currentY);
    doc.setFont('times', 'normal');
    doc.text('The Public Information Officer,', leftMargin, currentY);
    currentY += lineHeightTight;

    const addresseeLines = draft.addressee.split('\n')
    .filter(line => !/^the public information officer,?$/i.test(line.trim()));

    for (const segment of addresseeLines) {
        const wrapped = doc.splitTextToSize(segment.trim(), printableWidth);
        for (const line of wrapped) {
        currentY = checkAndAddPage(doc, currentY);
        doc.text(line, leftMargin, currentY);
        currentY += lineHeightTight;
        }
    }
    currentY += lineHeightBody;

    // Section 3: Subject line 
    currentY = checkAndAddPage(doc, currentY);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('Subject: ', leftMargin, currentY);
    const subjectLabelWidth = doc.getTextWidth('Subject: ');
    doc.setFont('times', 'normal');
    const subjectAvailableWidth = printableWidth - subjectLabelWidth;
    const subjectFirstLine = doc.splitTextToSize(draft.subject, subjectAvailableWidth)[0];
    doc.text(subjectFirstLine, leftMargin + subjectLabelWidth, currentY);
    currentY += lineHeightBody;

    const subjectAllLines = doc.splitTextToSize(draft.subject, printableWidth);
    if (subjectAllLines.length > 1) {
        for (let i = 1; i < subjectAllLines.length; i++) {
        currentY = checkAndAddPage(doc, currentY);
        doc.text(subjectAllLines[i], leftMargin, currentY);
        currentY += lineHeightBody;
        }
    }
    currentY += lineHeightBody;

    // Section 4: Section 6(1) invocation paragraph 
    // Personal fields in the invocation are rendered segment by segment
    // so bold/normal weight can be applied per token 
    currentY = checkAndAddPage(doc, currentY);
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const invocationPrefix = 'I, ';
    const invocationMid1 = ', resident of ';
    const invocationMid2 = ', hereby request information under Section 6(1) of the Right to ' +
        'Information Act, 2005 regarding the following:';

    // Assemble full string for splitTextToSize to get correct line breaks
    const invocationFull =
        invocationPrefix + draft._applicantName +
        invocationMid1 + draft._applicantAddress +
        invocationMid2;
    const invocationLines = doc.splitTextToSize(invocationFull, printableWidth);
    for (const line of invocationLines) {
        currentY = checkAndAddPage(doc, currentY);
        doc.text(line, leftMargin, currentY);
        currentY += lineHeightBody;
    }
    currentY += lineHeightBody;

    //Section 5: Numbered request lines
    doc.setFont('times', 'normal');
    for (let i = 0; i < draft.requests.length; i++) {
        const prefix = `${i + 1}.  `;
        const prefixWidth = doc.getTextWidth(prefix);
        const requestAvailableWidth = printableWidth - prefixWidth;
        const requestLines = doc.splitTextToSize(draft.requests[i], requestAvailableWidth);

        currentY = checkAndAddPage(doc, currentY);
        doc.text(prefix, leftMargin, currentY);
        doc.text(requestLines[0], leftMargin + prefixWidth, currentY);
        currentY += lineHeightBody;

        for (let j = 1; j < requestLines.length; j++) {
        currentY = checkAndAddPage(doc, currentY);
        doc.text(requestLines[j], leftMargin + prefixWidth, currentY);
        currentY += lineHeightBody;
        }
        currentY += 2;
    }
    currentY += lineHeightBody;

    //Section 6: Fee declaration
    currentY = checkAndAddPage(doc, currentY);
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    const feeDeclaration = 'The prescribed application fee of Rs. 10/- is enclosed herewith.';
    const feeLines = doc.splitTextToSize(feeDeclaration, printableWidth);
    for (const line of feeLines) {
        currentY = checkAndAddPage(doc, currentY);
        doc.text(line, leftMargin, currentY);
        currentY += lineHeightBody;
    }
    currentY += lineHeightBody;

    //Section 7: Closing sentence
    currentY = checkAndAddPage(doc, currentY);
    const closing = 'I request that the information be provided within the stipulated time period as per the RTI Act, 2005.';
    const closingLines = doc.splitTextToSize(closing, printableWidth);
    for (const line of closingLines) {
        currentY = checkAndAddPage(doc, currentY);
        doc.text(line, leftMargin, currentY);
        currentY += lineHeightBody;
    }
    currentY += lineHeightBody * 2;

    //Section 8: Signature block 
    currentY = checkAndAddPage(doc, currentY);
    doc.setFontSize(12);

    // Date
    doc.setFont('times', 'bold');
    doc.text('Date: ', leftMargin, currentY);
    const dateLabelWidth = doc.getTextWidth('Date: ');
    doc.setFont('times', 'normal');
    doc.text(draft._date || '', leftMargin + dateLabelWidth, currentY);
    currentY += lineHeightBody * 2;

    // Yours faithfully
    currentY = checkAndAddPage(doc, currentY);
    doc.setFont('times', 'normal');
    doc.text('Yours faithfully,', leftMargin, currentY);
    currentY += lineHeightBody * 2;

    // Applicant Name — bold if unfilled token, normal if filled
    currentY = checkAndAddPage(doc, currentY);
    renderPersonalField(draft._applicantName, leftMargin, currentY);
    currentY += lineHeightBody;

    // Applicant Contact — bold if unfilled token, normal if filled
    currentY = checkAndAddPage(doc, currentY);
    renderPersonalField(draft._applicantContact, leftMargin, currentY);
    currentY += lineHeightBody;

    // Applicant Address — may wrap; check token on the raw value,
    // rendering wrapped lines individually
    const addressWrapped = doc.splitTextToSize(draft._applicantAddress, printableWidth);
    if (PLACEHOLDER_TOKENS.includes(draft._applicantAddress)) {
        // Unfilled token: rendering single line bold
        currentY = checkAndAddPage(doc, currentY);
        doc.setFont('times', 'bold');
        doc.text(draft._applicantAddress, leftMargin, currentY);
        doc.setFont('times', 'normal');
        
    } else {
        // Filled value: rendering wrapped lines in normal weight
        for (const line of addressWrapped) {
        currentY = checkAndAddPage(doc, currentY);
        doc.setFont('times', 'normal');
        doc.text(line, leftMargin, currentY);
        currentY += lineHeightBody;
        }
    }
    // Page count function
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        const pageLabel = `Page ${p} of ${totalPages}`;
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.text(pageLabel, 105, pageHeight - 10, { align: 'center' });
    }

    doc.save('rti_application.pdf');
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
        generatePDF(editedDraft);
    }

    function handleDownloadAnyway() {
        setShowPlaceholderWarning(false);
        generatePDF(editedDraft);
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