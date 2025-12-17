// frontend/src/components/Automation/ConditionBuilder.js
import React from 'react';

const ConditionBuilder = ({ condition, onChange }) => {
  const operators = [
    { id: 'equals', label: '=' },
    { id: 'not_equals', label: '≠' },
    { id: 'greater_than', label: '>' },
    { id: 'less_than', label: '<' },
    { id: 'contains', label: 'contains' },
    { id: 'not_contains', label: 'not contains' },
    { id: 'is_empty', label: 'is empty' },
    { id: 'is_not_empty', label: 'is not empty' }
  ];

  const dealFields = [
    { id: 'stage', label: 'Stage' },
    { id: 'amount', label: 'Amount' },
    { id: 'probability', label: 'Probability' },
    { id: 'closeDate', label: 'Close Date' },
    { id: 'tags', label: 'Tags' }
  ];

  return (
    <div className="condition-builder">
      <select
        className="condition-field"
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value })}
      >
        <option value="">Select field...</option>
        {dealFields.map(field => (
          <option key={field.id} value={field.id}>{field.label}</option>
        ))}
      </select>

      <select
        className="condition-operator"
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value })}
      >
        {operators.map(op => (
          <option key={op.id} value={op.id}>{op.label}</option>
        ))}
      </select>

      {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
        <input
          type="text"
          className="condition-value"
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="Value"
        />
      )}
    </div>
  );
};

export default ConditionBuilder;
