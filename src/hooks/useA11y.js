import { useEffect, useRef } from 'react';

/**
 * Custom hook for focus management
 * Automatically focuses an element when component mounts or dependency changes
 */
export function useFocusOnMount(dependency = null) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [dependency]);

  return ref;
}

/**
 * Custom hook for focus trap (useful for modals, dialogs)
 * Keeps focus within a specific container
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Custom hook for keyboard navigation in lists/grids
 * Provides arrow key navigation
 */
export function useKeyboardNavigation(items, onSelect) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect && items[selectedIndex]) {
          onSelect(items[selectedIndex]);
        }
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(items.length - 1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].focus();
    }
  }, [selectedIndex]);

  return {
    selectedIndex,
    setSelectedIndex,
    itemRefs,
    handleKeyDown,
  };
}

/**
 * Announce to screen readers
 * Creates a live region announcement
 */
export function useAnnouncer() {
  const announcerRef = useRef(null);

  useEffect(() => {
    // Create announcer div if it doesn't exist
    if (!document.getElementById('a11y-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'a11y-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    } else {
      announcerRef.current = document.getElementById('a11y-announcer');
    }
  }, []);

  const announce = (message, priority = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return announce;
}

/**
 * Hook for managing skip links
 */
export function useSkipLink(targetId) {
  const handleSkip = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  return handleSkip;
}

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export function useId(prefix = 'a11y') {
  const idRef = useRef(null);
  
  if (idRef.current === null) {
    idRef.current = `${prefix}-${++idCounter}`;
  }
  
  return idRef.current;
}
