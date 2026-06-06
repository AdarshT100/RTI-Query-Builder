import React from 'react';

export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="spinner">
      <span>{message}</span>
    </div>
  );
}
