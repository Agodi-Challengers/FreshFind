import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

/** Small status messages ("Saved", "Link copied"), announced to screen readers. */
export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const timer = useRef();

  const show = useCallback((text) => {
    window.clearTimeout(timer.current);
    setMessage({ text, id: Date.now() });
    timer.current = window.setTimeout(() => setMessage(null), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="visually-hidden">
        {message?.text}
      </div>
      {message && (
        <div key={message.id} className="ff-toast" aria-hidden="true">
          {message.text}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
