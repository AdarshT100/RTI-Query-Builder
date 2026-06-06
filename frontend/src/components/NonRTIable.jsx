import React from 'react';

export default function NonRTIable({ variant, heading, body, alternative, onReset }) {
  return (
    <div>
      <h2>{heading}</h2>
      <p>{body}</p>
      {alternative && <div className="alternative">{alternative}</div>}
      <button onClick={onReset}>{variant === 'non_rti_able' ? 'Try a different complaint' : 'Try again'}</button>
    </div>
  );
}
