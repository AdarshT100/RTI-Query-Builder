import { useState } from "react";
import './ClarifyingQuestions.css'

export default function ClarifyingQuestions({
    questions, languageNote, onAnswersSubmit
}) {
    const [answers, setAnswers]=useState({})

    function handleTextChange(defectType, value){
        setAnswers(prev => ({...prev, [defectType]:value}))
    }

    function handleDateRangeChange(defectType, field, value){
        setAnswers(prev => {
            const existing = prev[defectType] || {from: '', to: ''}
            return {...prev, [defectType]: {...existing, [field]:value}}
        })
    }

    function handleSubmit(){
        const assembled = {}
        for (const q of questions){
            const raw = answers[q.defect_type]
            if(q.input_type ==='date_range'){
                const from = raw?.from || ''
                const to = raw?.to || ''
                assembled[q.defect_type] = `${from} to ${to}`
            }
            else{
                assembled[q.defect_type] = raw || ''
            }
        }
        onAnswersSubmit(assembled)
    }

    const allAnswered = questions.every(q =>{
        const raw = answers[q.defect_type]
        if(q.input_type === 'date_range'){
            return raw?.from?.trim() && raw?.to?.trim()
        }
        return typeof raw === 'string' && raw.trim().length>0
    })
    return(
        <div className="clarifying-questions">
        {languageNote && (
            <div className="clarifying-questions__language-note" role="note">
            {languageNote}
            </div>
        )}

        <h2 className="clarifying-questions__heading">
            A few quick questions
        </h2>
        <p className="clarifying-questions__subheading">
            Your answers help us build a more precise RTI Document.
        </p>

        <div className="clarifying-questions__list">
            {questions.map((q) => (
            <div key={q.defect_type} className="clarifying-questions__item">
                <label
                className="clarifying-questions__label"
                htmlFor={q.input_type === 'date_range' ? `${q.defect_type}-from` : q.defect_type}
                >
                {q.question}
                </label>

                {q.input_type === 'date_range' ? (
                <div className="clarifying-questions__date-range">
                    <div className="clarifying-questions__date-field">
                    <label
                        className="clarifying-questions__date-label"
                        htmlFor={`${q.defect_type}-from`}
                    >
                        From
                    </label>
                    <input
                        id={`${q.defect_type}-from`}
                        type="date"
                        className="clarifying-questions__input clarifying-questions__input--date"
                        value={answers[q.defect_type]?.from || ''}
                        onChange={e => handleDateRangeChange(q.defect_type, 'from', e.target.value)}
                    />
                    </div>
                    <div className="clarifying-questions__date-field">
                    <label
                        className="clarifying-questions__date-label"
                        htmlFor={`${q.defect_type}-to`}
                    >
                        To
                    </label>
                    <input
                        id={`${q.defect_type}-to`}
                        type="date"
                        className="clarifying-questions__input clarifying-questions__input--date"
                        value={answers[q.defect_type]?.to || ''}
                        onChange={e => handleDateRangeChange(q.defect_type, 'to', e.target.value)}
                    />
                    </div>
                </div>
                ) : (
                <input
                    id={q.defect_type}
                    type="text"
                    className="clarifying-questions__input"
                    value={answers[q.defect_type] || ''}
                    onChange={e => handleTextChange(q.defect_type, e.target.value)}
                />
                )}
            </div>
            ))}
        </div>

        <button
            className="clarifying-questions__submit"
            onClick={handleSubmit}
            disabled={!allAnswered}
        >
            Generate RTI application
        </button>
        </div>
    )
}