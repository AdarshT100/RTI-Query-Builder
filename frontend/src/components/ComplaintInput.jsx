    import { useState, useEffect, useRef } from 'react'
    import './ComplaintInput.css'

    const MAX_CHARS = 2000
    const TURNSTILE_SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY || '1x00000000000000000000AA'

    let widgetRendered = false

    export default function ComplaintInput({ onSubmit }) {
    const [value, setValue] = useState('')
    const [captchaToken, setCaptchaToken] = useState(null)
    const widgetContainerRef = useRef(null)
    const widgetIdRef = useRef(null)
    
    const remaining = MAX_CHARS - value.length
    const isOverLimit = value.length > MAX_CHARS
    const isEmpty = value.trim().length === 0
    const isSubmitDisabled = isOverLimit || isEmpty || captchaToken == null

    useEffect(() => {
        
        function renderWidget() {
        if (!window.turnstile || !widgetContainerRef.current) return
        if (widgetRendered) return
        widgetRendered = true

        widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
            sitekey: TURNSTILE_SITEKEY,
            callback: (token) => {
            setCaptchaToken(token)
            },
            'expired-callback': () => {
            setCaptchaToken(null)
            if (widgetIdRef.current !== null) {
                window.turnstile.reset(widgetIdRef.current)
            }
            },
            'error-callback': () => {
            setCaptchaToken(null)
            },
        })
        
        }

        let interval = null

        if (window.turnstile) {
        renderWidget()
        } else {
        interval = setInterval(() => {
            if (window.turnstile) {
            clearInterval(interval)
            renderWidget()
            }
        }, 100)
        }

        return () => {
        if (interval) clearInterval(interval)
        if (widgetIdRef.current !== null && window.turnstile) {
            window.turnstile.remove(widgetIdRef.current)
            widgetIdRef.current = null
        }
        }
    }, [])

    function handleSubmit() {
        if (isSubmitDisabled) return
        onSubmit(value, captchaToken)
    }

    return (
        <div className="complaint-input">
        <label className="complaint-input__label" htmlFor="complaint-textarea">
            Describe your complaint
            <span className="complaint-input__hint">
            Write it the way you would explain it to a friend — in any language.
            </span>
        </label>

        <textarea
            id="complaint-textarea"
            className={`complaint-input__textarea${isOverLimit ? ' complaint-input__textarea--over-limit' : ''}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. The road outside our colony has been broken for 6 months. I complained to the PWD office but nothing has happened."
            aria-describedby="complaint-counter"
        />

        <div className="complaint-input__footer">
            <span
            id="complaint-counter"
            className={`complaint-input__counter${isOverLimit ? ' complaint-input__counter--over-limit' : ''}`}
            aria-live="polite"
            >
            {remaining.toLocaleString('en-IN')} / {MAX_CHARS.toLocaleString('en-IN')}
            </span>

            <button
            className="complaint-input__submit"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            >
            Analyze complaint
            </button>
        </div>

        {/* TODO: replace data-sitekey with production sitekey from Cloudflare dashboard before deploying */}
        <div ref={widgetContainerRef} />
        </div>
    )
    }