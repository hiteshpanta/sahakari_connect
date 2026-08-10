import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`card-title ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
};

export const CardSubtitle = ({ children, className = '', ...props }) => {
  return (
    <p className={`card-subtitle ${className}`.trim()} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  // We can just use a standard div for content since the card itself has padding
  return (
    <div className={`${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
