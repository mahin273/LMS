import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refetchUser } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');

        const handleAuth = async () => {
            if (token) {
                setToken(token);
                // Ideally also save refreshToken if your auth lib supports it. 
                // For now, assuming setToken handles the main access token.
                // If you have a separate storage for refreshToken, handle it here.
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }

                try {
                    await refetchUser();
                    navigate('/dashboard');
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    navigate('/login?error=auth_failed');
                }
            } else {
                navigate('/login?error=no_token');
            }
        };

        handleAuth();
    }, [searchParams, navigate, refetchUser]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Authenticating...</p>
            </div>
        </div>
    );
}
