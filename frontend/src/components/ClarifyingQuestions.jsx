import React from 'react';

export default function ClarifyingQuestions({ questions = [], languageNote = null, onAnswersSubmit = () => {} }) {
  return (
    <div>
      {languageNote && <div className="language-note">{languageNote}</div>}
      <form onSubmit={e => { e.preventDefault(); onAnswersSubmit({}); }}>
        {questions.map(q => (
          <div key={q.defect_type}>
            <label>{q.question}</label>
            <input type="text" />
          </div>
        ))}
        <button type="submit">Submit Answers</button>
      </form>
    </div>
  );
}
