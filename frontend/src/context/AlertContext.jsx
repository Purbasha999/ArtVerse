import { createContext, useCallback, useContext, useState } from 'react';

const AlertContext = createContext(null);

const AUTO_DISMISS_MS = 5000;

export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]); // { id, type: 'success' | 'danger', message }

    const dismissAlert = useCallback((id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const showAlert = useCallback((type, message) => {
        if (!message) return;
        const id = Date.now() + Math.random();
        setAlerts(prev => [...prev, { id, type, message }]);
        setTimeout(() => dismissAlert(id), AUTO_DISMISS_MS);
    }, [dismissAlert]);

    const showSuccess = useCallback((message) => showAlert('success', message), [showAlert]);
    const showError = useCallback((message) => showAlert('danger', message), [showAlert]);

    return (
        <AlertContext.Provider value={{ alerts, showSuccess, showError, dismissAlert }}>
            {children}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error('useAlert must be used within an AlertProvider');
    return ctx;
}
