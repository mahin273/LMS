import { useAuth } from '@/context/AuthContext';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
        >
            {user?.role === 'admin' && <AdminDashboard />}
            {user?.role === 'instructor' && <InstructorDashboard />}
            {user?.role === 'student' && <StudentDashboard />}
        </motion.div>
    );
}
