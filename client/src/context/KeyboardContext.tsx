import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

type FocusableInput = HTMLInputElement | HTMLTextAreaElement;

interface KeyboardContextValue {
  visible: boolean;
  inputRef: FocusableInput | null;
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
  const [inputRef, setInputRef] = useState<FocusableInput | null>(null);
  const currentInputRef = useRef<FocusableInput | null>(null);

  const hideKeyboard = useCallback(() => {
    setVisible(false);
    setInputRef(null);
    currentInputRef.current = null;
  }, []);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      const isInput = target instanceof HTMLInputElement;
      const isTextarea = target instanceof HTMLTextAreaElement;
      if (!isInput && !isTextarea) return;

      // Exclude PIN pad inputs and non-text inputs (per RESEARCH.md Pitfall 1)
      if (isInput && (
        target.dataset.noKeyboard !== undefined ||
        target.type === 'tel' ||
        target.type === 'number' ||
        target.type === 'hidden' ||
        target.type === 'checkbox' ||
        target.type === 'radio'
      )) {
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

  return (
    <KeyboardContext.Provider value={{ visible, inputRef, hideKeyboard }}>
      <div style={{ paddingBottom: visible ? 280 : 0, transition: 'padding-bottom 200ms ease-out' }}>
        {children}
      </div>
    </KeyboardContext.Provider>
  );
}
