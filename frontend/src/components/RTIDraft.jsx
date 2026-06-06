import React from 'react';

export default function RTIDraft({ rtiDraft = {} }) {
  return (
    <div>
      <h2>RTI Draft</h2>
      <pre>{JSON.stringify(rtiDraft, null, 2)}</pre>
    </div>
  );
}
