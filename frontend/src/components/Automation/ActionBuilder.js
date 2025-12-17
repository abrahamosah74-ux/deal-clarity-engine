// frontend/src/components/Automation/ActionBuilder.js
import React from 'react';

const ActionBuilder = ({ action, availableActions, onChange }) => {
  const selectedActionDef = availableActions.find(a => a.id === action.type);

  return (
    <div className="action-builder">
      <select
        className="action-type"
        value={action.type}
        onChange={(e) => onChange({ type: e.target.value, config: {} })}
      >
        <option value="">Select action...</option>
        {availableActions.map(actionDef => (
          <option key={actionDef.id} value={actionDef.id}>{actionDef.name}</option>
        ))}
      </select>

      {selectedActionDef && selectedActionDef.config && (
        <div className="action-config">
          {Object.entries(selectedActionDef.config).map(([key, field]) => (
            <div key={key} className="config-field">
              <label>
                {key.replace(/([A-Z])/g, ' $1').trim()}
                {field.required && <span className="required">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  value={action.config[key] || ''}
                  onChange={(e) => onChange({
                    ...action,
                    config: { ...action.config, [key]: e.target.value }
                  })}
                >
                  <option value="">Select...</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={action.config[key] || ''}
                  onChange={(e) => onChange({
                    ...action,
                    config: { ...action.config, [key]: e.target.value }
                  })}
                  placeholder={field.help || key}
                  rows="2"
                />
              ) : (
                <input
                  type={field.type}
                  value={action.config[key] || ''}
                  onChange={(e) => onChange({
                    ...action,
                    config: { ...action.config, [key]: e.target.value }
                  })}
                  placeholder={field.help || key}
                />
              )}

              {field.help && <small>{field.help}</small>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionBuilder;
