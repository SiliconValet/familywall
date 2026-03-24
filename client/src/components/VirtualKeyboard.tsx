import { useRef, useEffect, useCallback } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { useKeyboard } from '../context/KeyboardContext';

const layout = {
  default: [
    '1 2 3 4 5 6 7 8 9 0 {bksp}',
    'q w e r t y u i o p',
    'a s d f g h j k l',
    'z x c v b n m {space}',
    '{done}'
  ]
};

const display = {
  '{bksp}': '\u232B',
  '{space}': 'Space',
  '{done}': 'Done',
};

export function VirtualKeyboard() {
  const { visible, inputRef, hideKeyboard } = useKeyboard();
  const keyboardRef = useRef<any>(null);
  const prevInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Reset keyboard buffer when input changes (per RESEARCH.md Pitfall 2)
  useEffect(() => {
    if (inputRef && inputRef !== prevInputRef.current) {
      prevInputRef.current = inputRef;
      if (keyboardRef.current) {
        keyboardRef.current.setInput(inputRef.value || '');
      }
    }
  }, [inputRef]);

  const handleChange = useCallback((value: string) => {
    if (!inputRef) return;

    // Set the value on the input/textarea and dispatch an input event so React picks up the change
    const proto = inputRef instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeValueSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

    if (nativeValueSetter) {
      nativeValueSetter.call(inputRef, value);
      inputRef.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, [inputRef]);

  const handleKeyPress = useCallback((button: string) => {
    if (button === '{done}') {
      inputRef?.blur();
      hideKeyboard();
    }
  }, [inputRef, hideKeyboard]);

  // Inject CSS overrides for keyboard touch targets (44px min per FAM-07)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hg-theme-default .hg-button {
        min-height: 44px !important;
        font-size: 18px !important;
        border-radius: 6px !important;
      }
      .hg-theme-default .hg-button[data-skbtn="{done}"] {
        min-height: 48px !important;
        max-width: 100% !important;
      }
      .hg-theme-default .hg-button[data-skbtn="{space}"] {
        max-width: none !important;
        flex-grow: 3 !important;
      }
      .hg-theme-default .hg-button:active {
        transform: scale(0.96);
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div
      data-keyboard
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: visible ? 280 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 200ms ease-out',
        zIndex: 9999,
        backgroundColor: 'var(--background)',
        borderTop: '1px solid var(--border)',
        willChange: visible ? 'transform' : 'auto',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '8px 4px' }}>
        <Keyboard
          keyboardRef={(r: any) => (keyboardRef.current = r)}
          layout={layout}
          display={display}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          theme="hg-theme-default"
          mergeDisplay
        />
      </div>
    </div>
  );
}
