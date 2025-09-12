// Test file to verify ESLint rules are working
import React from 'react';

// This should trigger ESLint errors:
const TestComponent = () => {
  return (
    <div>
      {/* Should trigger: hardcoded hex color */}
      <div style={{ color: '#ff0000' }}>Red text</div>

      {/* Should trigger: hardcoded RGB */}
      <div style={{ backgroundColor: 'rgb(255, 0, 0)' }}>Red background</div>

      {/* Should trigger: non-semantic Tailwind color */}
      <div className="text-red-500 bg-gray-100">Bad colors</div>

      {/* Should trigger: legacy fw- class */}
      <div className="fw-text-shadow">Legacy class</div>

      {/* Should trigger: transition-all */}
      <div className="transition-all">Bad transition</div>

      {/* These should be OK: */}
      <div className="text-fx-primary bg-fx-bg-subtle transition-colors">Good classes</div>
      <div style={{ color: 'var(--fx-text-primary)' }}>Good CSS variable</div>
    </div>
  );
};

export default TestComponent;
