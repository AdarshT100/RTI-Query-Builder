import React, { useState } from 'react';

export default function ComplaintInput({ onSubmit }) {
  const [value, setValue] = useState('');
  const max = 2000;

  return (
    <div>
      <label htmlFor="complaint">Complaint</label>
      <textarea id="complaint" value={value} onChange={e => setValue(e.target.value)} />
      <div>{value.length} / {max}</div>
      <button disabled={value.length > max} onClick={() => onSubmit && onSubmit(value)}>Submit</button>
    </div>
  );
}
