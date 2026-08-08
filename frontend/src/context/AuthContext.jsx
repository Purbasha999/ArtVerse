import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authApi.fetchCurrentUser()
            .then(setCurrentUser)
            .catch(() => setCurrentUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (username, password) => {
        const { user, message } = await authApi.login(username, password);
        setCurrentUser(user);
        return message;
    };

    const register = async (username, email, phone, password, confirmPassword) => {
        const { user, message } = await authApi.register(username, email, phone, password, confirmPassword);
        setCurrentUser(user);
        return message;
    };

    const logout = async () => {
        const { message } = await authApi.logout();
        setCurrentUser(null);
        return message;
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, login, register, logout, updateCurrentUser: setCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
