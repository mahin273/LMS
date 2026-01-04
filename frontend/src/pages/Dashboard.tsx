import { useAuth } from '@/context/AuthContext';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            {user?.role === 'admin' && <AdminDashboard />}
            {user?.role === 'instructor' && <InstructorDashboard />}
            {user?.role === 'student' && <StudentDashboard />}
        </div>
    );
}
