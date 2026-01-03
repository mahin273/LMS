import { createContext, useContext, useState, useEffect } from 'react';
import client from '@/api/client';
import { getToken, removeToken } from '@/lib/auth';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => void;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: () => { },
    refetchUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        if (!getToken()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await client.get('/auth/me');
            setUser(res.data.user);
        } catch (error) {
            console.error(error);
            // Invalid token?
            removeToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = () => {
        removeToken();
        setUser(null);
        window.location.href = '/login'; // Hard redirect to clear state
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, refetchUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};
