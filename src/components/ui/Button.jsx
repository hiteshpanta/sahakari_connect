import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon, 
  ...props 
}) => {
  // Map variants to CSS classes
  const variantClass = variant === 'primary' ? 'btn-primary' 
                     : variant === 'success' ? 'btn-success'
                     : variant === 'danger' ? 'btn-danger'
                     : variant === 'warning' ? 'btn-warning'
                     : variant === 'outline' ? 'btn-outline'
                     : variant === 'ghost' ? 'btn-ghost'
                     : 'btn-primary';
  
  // Map sizes to CSS classes
  const sizeClass = size === 'sm' ? 'btn-sm' 
                  : size === 'lg' ? 'btn-lg' 
                  : size === 'icon' ? 'btn-icon'
                  : '';
                  
  const combinedClassName = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button className={combinedClassName} {...props}>
      {icon && <span className="btn-icon-wrapper">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
