import { useNavigate } from 'react-router-dom';
import { removeToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        removeToken();
        navigate('/login');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <p>Welcome to your LMS Dashboard.</p>
        </div>
    );
}
