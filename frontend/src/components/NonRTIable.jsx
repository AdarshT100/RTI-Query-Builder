    import './NonRTIable.css';

    const NonRTIable = ({ variant, heading, body, alternative, onReset }) => {
    const buttonLabel =
        variant === 'non_rti_able' ? 'Try a different complaint' : 'Try again';

    return (
        <div className="non-rtiable">
        <h2 className="non-rtiable__heading">{heading}</h2>
        <p className="non-rtiable__body">{body}</p>

        {alternative !== null && alternative !== undefined && (
            <div className="non-rtiable__alternative">
            <span className="non-rtiable__alternative-label">Where to go instead</span>
            <p className="non-rtiable__alternative-text">{alternative}</p>
            </div>
        )}

        <button className="non-rtiable__btn" onClick={onReset}>
            {buttonLabel}
        </button>
        </div>
    );
    };

    export default NonRTIable;