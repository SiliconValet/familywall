import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

interface KeyboardContextValue {
  visible: boolean;
  inputRef: HTMLInputElement | null;
  hideKeyboard: () => void;
}

const KeyboardContext = createContext<KeyboardContextValue>({
  visible: false,
  inputRef: null,
  hideKeyboard: () => {},
});

export function useKeyboard() {
  return useContext(KeyboardContext);
}

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const currentInputRef = useRef<HTMLInputElement | null>(null);

  const hideKeyboard = useCallback(() => {
    setVisible(false);
    setInputRef(null);
    currentInputRef.current = null;
  }, []);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;

      // Exclude PIN pad inputs and non-text inputs (per RESEARCH.md Pitfall 1)
      if (
        target.dataset.noKeyboard !== undefined ||
        target.type === 'tel' ||
        target.type === 'number' ||
        target.type === 'hidden' ||
        target.type === 'checkbox' ||
        target.type === 'radio'
      ) {
        return;
      }

      currentInputRef.current = target;
      setInputRef(target);
      setVisible(true);
    };

    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
    };
  }, []);

  // Handle click outside to dismiss keyboard (D-07)
  useEffect(() => {
    if (!visible) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;

      // Don't dismiss if clicking on the keyboard itself
      if (target.closest('[data-keyboard]')) return;

      // Don't dismiss if clicking on an input
      if (target instanceof HTMLInputElement) return;

      hideKeyboard();
    };

    // Use a small delay to avoid catching the focus event's click
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [visible, hideKeyboard]);

  return (
    <KeyboardContext.Provider value={{ visible, inputRef, hideKeyboard }}>
      <div style={{ paddingBottom: visible ? 280 : 0, transition: 'padding-bottom 200ms ease-out' }}>
        {children}
      </div>
    </KeyboardContext.Provider>
  );
}
