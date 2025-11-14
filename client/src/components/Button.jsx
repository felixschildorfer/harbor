import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button component with multiple variants and states
 * @param {Object} props - Component props
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} props.variant - Button style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.ariaLabel - Accessibility label
 */
const Button = React.memo(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
  ariaLabel,
  type = 'button',
  ...rest
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantStyles = {
    primary: 'bg-navy-950 text-white hover:bg-navy-900 focus-visible:ring-navy-950',
    secondary: 'bg-ocean-600 text-white hover:bg-ocean-700 focus-visible:ring-ocean-600',
    danger: 'bg-rust-500 text-white hover:bg-rust-600 focus-visible:ring-rust-500',
    ghost: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={combinedClassName}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <span className="spinner" aria-hidden="true" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
