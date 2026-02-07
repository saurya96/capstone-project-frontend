/**
 * Accessibility utility functions
 */

/**
 * Check if element is focusable
 */
export function isFocusable(element) {
  if (!element || element.disabled) return false;
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container) {
  if (!container) return [];
  
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(selector));
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function trapFocus(container, event) {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.key === 'Tab') {
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

/**
 * Create accessible error message for form field
 */
export function getErrorProps(fieldName, error, touched) {
  const hasError = touched && error;
  return {
    'aria-invalid': hasError ? 'true' : 'false',
    'aria-describedby': hasError ? `${fieldName}-error` : undefined,
    className: hasError ? 'input-error' : '',
  };
}

/**
 * Generate ARIA label for form validation state
 */
export function getValidationLabel(isValid, fieldLabel) {
  if (isValid === true) return `${fieldLabel}, valid input`;
  if (isValid === false) return `${fieldLabel}, invalid input`;
  return fieldLabel;
}

/**
 * Create live region announcement
 */
export function announce(message, priority = 'polite') {
  const announcer = document.getElementById('a11y-announcer') || createAnnouncer();
  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;
  
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

function createAnnouncer() {
  const announcer = document.createElement('div');
  announcer.id = 'a11y-announcer';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  document.body.appendChild(announcer);
  return announcer;
}

/**
 * Format date for screen readers
 */
export function formatDateForA11y(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for screen readers
 */
export function formatTimeForA11y(timeString) {
  if (!timeString) return '';
  // Assumes format like "09:00 AM"
  return timeString.replace(/(\d+):(\d+)\s*(AM|PM)/, '$1 $2 $3');
}

/**
 * Create accessible button with proper ARIA attributes
 */
export function getButtonA11yProps(options = {}) {
  const { 
    pressed, 
    expanded, 
    controls, 
    label, 
    describedBy,
    disabled,
  } = options;
  
  return {
    'aria-pressed': pressed !== undefined ? pressed : undefined,
    'aria-expanded': expanded !== undefined ? expanded : undefined,
    'aria-controls': controls || undefined,
    'aria-label': label || undefined,
    'aria-describedby': describedBy || undefined,
    'aria-disabled': disabled || undefined,
    role: 'button',
  };
}

/**
 * Navigation keys helper
 */
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
};

/**
 * Check if keyboard event is an action key (Enter or Space)
 */
export function isActionKey(event) {
  return event.key === KEYS.ENTER || event.key === KEYS.SPACE;
}

/**
 * Check if keyboard event is navigation
 */
export function isNavigationKey(event) {
  return [
    KEYS.ARROW_UP,
    KEYS.ARROW_DOWN,
    KEYS.ARROW_LEFT,
    KEYS.ARROW_RIGHT,
    KEYS.HOME,
    KEYS.END,
  ].includes(event.key);
}

/**
 * Polyfill for inert attribute (future-proofing)
 */
export function setInert(element, isInert) {
  if ('inert' in HTMLElement.prototype) {
    element.inert = isInert;
  } else {
    // Fallback for browsers without inert support
    if (isInert) {
      element.setAttribute('aria-hidden', 'true');
      const focusable = getFocusableElements(element);
      focusable.forEach(el => el.setAttribute('tabindex', '-1'));
    } else {
      element.removeAttribute('aria-hidden');
      const focusable = getFocusableElements(element);
      focusable.forEach(el => el.removeAttribute('tabindex'));
    }
  }
}
