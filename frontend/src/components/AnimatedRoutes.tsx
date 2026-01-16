import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AuthCallback from '../pages/AuthCallback';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import Dashboard from '../pages/Dashboard';
import CreateCoursePage from '../pages/CreateCoursePage';
import EditCoursePage from '../pages/EditCoursePage';
import CoursePlayerPage from '../pages/CoursePlayerPage';
import CoursesPage from '../pages/CoursesPage';
import LandingPage from '../pages/LandingPage';
import AdminStudentsPage from '../pages/AdminStudentsPage';
import AdminInstructorsPage from '../pages/AdminInstructorsPage';
import AdminCoursesPage from '../pages/AdminCoursesPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import SystemLogsPage from '../pages/SystemLogsPage';
import DatabaseSettingsPage from '../pages/DatabaseSettingsPage';
import ProfilePage from '../pages/ProfilePage';
import LeaderboardPage from '../pages/LeaderboardPage';
import CourseDetailsPage from '../pages/CourseDetailsPage';
import Layout from './Layout';
import RoleRoute from './RoleRoute';
import { isAuthenticated, getPayload } from '../lib/auth';
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { useParams } from 'react-router-dom';
import PageTransition from './PageTransition';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

function CourseAccessGuard() {
    const { courseId } = useParams();

    const { data: enrolledCourses, isLoading } = useQuery({
        queryKey: ['enrolled-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/enrolled');
            return res.data;
        },
        retry: false
    });

    if (isLoading) return <div>Loading access rights...</div>;

    const isEnrolled = enrolledCourses?.some((c: any) => c.id === courseId);
    const user = getPayload();

    if (isEnrolled || user?.role === 'admin') {
        return <CoursePlayerPage />;
    } else {
        return <CourseDetailsPage />;
    }
}

export default function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
                <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />

                {/* Protected Layout Routes */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                    <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                    <Route path="/leaderboard" element={<PageTransition><LeaderboardPage /></PageTransition>} />

                    <Route path="/courses" element={<PageTransition><CoursesPage /></PageTransition>} />
                    <Route path="/courses/new" element={<PageTransition><CreateCoursePage /></PageTransition>} />

                    <Route path="/courses/:courseId/edit" element={
                        <RoleRoute requiredRole="instructor">
                            <PageTransition><EditCoursePage /></PageTransition>
                        </RoleRoute>
                    } />

                    <Route path="/courses/:courseId" element={
                        <RoleRoute requiredRole={["student", "admin", "instructor"]}>
                            <PageTransition><CourseAccessGuard /></PageTransition>
                        </RoleRoute>
                    } />
                    <Route path="/courses/:courseId/lessons/:lessonId" element={<PageTransition><CoursePlayerPage /></PageTransition>} />

                    {/* Admin Routes */}
                    <Route path="/admin/students" element={<PageTransition><AdminStudentsPage /></PageTransition>} />
                    <Route path="/admin/instructors" element={<PageTransition><AdminInstructorsPage /></PageTransition>} />
                    <Route path="/admin/users" element={<PageTransition><AdminUsersPage /></PageTransition>} />
                    <Route path="/admin/courses" element={<PageTransition><AdminCoursesPage /></PageTransition>} />
                    <Route path="/admin/logs" element={<PageTransition><SystemLogsPage /></PageTransition>} />
                    <Route path="/admin/settings" element={<PageTransition><DatabaseSettingsPage /></PageTransition>} />
                </Route>

                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </AnimatePresence>
    );
}
