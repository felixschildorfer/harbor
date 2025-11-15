import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * ContextMenu component - displays a right-click context menu with custom actions
 * Supports both desktop (right-click) and mobile (long-press)
 * @param {Object} props - Component props
 * @param {Array} props.items - Menu items: [{label: string, onClick: function, variant?: 'default'|'danger'}]
 * @param {React.ReactNode} props.children - Content that triggers the menu
 */
const ContextMenu = React.memo(({ items, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const longPressTimer = useRef(null);

  // Handle right-click
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
      setIsOpen(true);
    }
  }, []);

  // Handle long-press on mobile
  const handleMouseDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          x: rect.left,
          y: rect.bottom + 5,
        });
        setIsOpen(true);
      }
    }, 500); // 500ms long-press
  }, []);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && 
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleMenuItemClick = useCallback((onClick) => {
    onClick();
    setIsOpen(false);
  }, []);

  return (
    <div
      ref={triggerRef}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative"
    >
      {children}

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-max bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transformOrigin: 'left top',
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuItemClick(item.onClick)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 flex items-center gap-2 hover:bg-slate-50 ${
                item.variant === 'danger'
                  ? 'text-rust-600 hover:bg-rust-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

ContextMenu.displayName = 'ContextMenu';

ContextMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['default', 'danger']),
    })
  ).isRequired,
  children: PropTypes.node.isRequired,
};

export default ContextMenu;
