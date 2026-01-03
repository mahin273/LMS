import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
    const { user, logout, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">LMS</h1>
                        <span className="text-sm text-muted-foreground ml-2">Hello, {user?.name} ({user?.role})</span>
                    </div>
                    <Button variant="ghost" onClick={logout}>Logout</Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {user?.role === 'admin' && <AdminDashboard />}
                {user?.role === 'instructor' && <InstructorDashboard />}
                {user?.role === 'student' && <StudentDashboard />}
            </main>
        </div>
    );
}
