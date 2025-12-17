// frontend/src/components/Automation/TriggerSelector.js
import React from 'react';

const TriggerSelector = ({ selected, availableTriggers, onChange }) => {
  return (
    <div className="trigger-selector">
      {availableTriggers.length === 0 ? (
        <p>Loading triggers...</p>
      ) : (
        <div className="trigger-grid">
          {availableTriggers.map(trigger => (
            <div
              key={trigger.id}
              className={`trigger-option ${selected?.type === trigger.id ? 'active' : ''}`}
              onClick={() => onChange({ type: trigger.id, config: trigger.config || {} })}
            >
              <div className="trigger-name">{trigger.name}</div>
              <div className="trigger-description">{trigger.description}</div>
            </div>
          ))}
        </div>
      )}

      {selected && selected.config && Object.keys(selected.config).length > 0 && (
        <div className="trigger-config">
          <h4>Trigger Configuration</h4>
          {Object.entries(selected.config).map(([key, field]) => (
            <div key={key} className="config-field">
              <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              {field.type === 'select' ? (
                <select name={key}>
                  <option value="">Select...</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input type={field.type} name={key} placeholder={key} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TriggerSelector;
