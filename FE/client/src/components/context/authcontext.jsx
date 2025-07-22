import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userToken'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('userInfo');
        if (!stored || stored === 'undefined') return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    });

    const login = (token, userInfo) => {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        setIsLoggedIn(true);
        setUser(userInfo);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        setIsLoggedIn(false);
        setUser(null);
    };

    useEffect(() => {
        const syncAuth = () => {
            const stored = localStorage.getItem('userInfo');
            if (!stored || stored === 'undefined') {
                setUser(null);
            } else {
                try {
                    setUser(JSON.parse(stored));
                } catch {
                    setUser(null);
                }
            }
            setIsLoggedIn(!!localStorage.getItem('userToken'));
        };
        syncAuth();
        window.addEventListener('storage', syncAuth);
        return () => window.removeEventListener('storage', syncAuth);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
