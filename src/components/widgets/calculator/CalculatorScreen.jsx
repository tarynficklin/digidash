import React from 'react';
import './CalculatorScreen.css';

// React 19 dropped defaultProps/propTypes on function components; use a default parameter.
export default function CalculatorScreen({ value = '' }) {
  return (
    <div className="CalculatorScreen theme-text">
      {value}
    </div>
  );
}
