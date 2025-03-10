import React, { useState, useEffect } from 'react';
import './Collapsible.css';

const Collapsible = ({ title, children, isControlled, isOpen: propIsOpen, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Sync with parent control when using controlled mode
  useEffect(() => {
    if (isControlled && propIsOpen !== undefined) {
      setInternalIsOpen(propIsOpen);
    }
  }, [propIsOpen, isControlled]);

  const handleToggle = () => {
    const newState = !internalIsOpen;
    if (isControlled) {
      onToggle?.(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  const isOpen = isControlled ? propIsOpen : internalIsOpen;

  return (
    <div className="collapsible">
      <div className="collapsible-header" onClick={handleToggle}>
        {title}
        <span className={`arrow ${isOpen ? 'open' : ''}`}></span>
      </div>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

Collapsible.defaultProps = {
  isControlled: false
};

export default Collapsible;
