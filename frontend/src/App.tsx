import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import CreateCoursePage from './pages/CreateCoursePage'
import EditCoursePage from './pages/EditCoursePage'
import CoursePlayerPage from './pages/CoursePlayerPage'
import CoursesPage from './pages/CoursesPage'
import LandingPage from './pages/LandingPage'
import AdminStudentsPage from './pages/AdminStudentsPage'
import AdminInstructorsPage from './pages/AdminInstructorsPage'
import AdminCoursesPage from './pages/AdminCoursesPage'
import SystemLogsPage from './pages/SystemLogsPage'
import DatabaseSettingsPage from './pages/DatabaseSettingsPage'
import ProfilePage from './pages/ProfilePage'
import { isAuthenticated } from './lib/auth'
import Layout from './components/Layout'
import RoleRoute from './components/RoleRoute'
import LeaderboardPage from './pages/LeaderboardPage'
import CourseDetailsPage from './pages/CourseDetailsPage'
import client from '@/api/client'; // Need this for the wrapper logic

// Wrapper to check enrollment
function CourseAccessGuard() {
  const { courseId } = useParams();

  // We need to know if the user is enrolled.
  // We can check the "enrolled-courses" list.
  const { data: enrolledCourses, isLoading } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => {
      const res = await client.get('/courses/enrolled');
      return res.data;
    },
    retry: false
  });

  if (isLoading) return <div>Loading access rights...</div>;

  // Check if courseId is in enrolledCourses
  const isEnrolled = enrolledCourses?.some((c: any) => c.id === courseId);

  if (isEnrolled) {
    return <CoursePlayerPage />;
  } else {
    return <CourseDetailsPage />;
  }
}


const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Layout Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/new" element={<CreateCoursePage />} />

              <Route path="/courses/:courseId/edit" element={
                <RoleRoute requiredRole="instructor">
                  <EditCoursePage />
                </RoleRoute>
              } />

              <Route path="/courses/:courseId" element={
                <RoleRoute requiredRole="student">
                  <CourseAccessGuard />
                </RoleRoute>
              } />
              <Route path="/courses/:courseId/lessons/:lessonId" element={<CoursePlayerPage />} />

              {/* Admin Routes */}
              <Route path="/admin/students" element={<AdminStudentsPage />} />
              <Route path="/admin/instructors" element={<AdminInstructorsPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/logs" element={<SystemLogsPage />} />
              <Route path="/admin/settings" element={<DatabaseSettingsPage />} />
            </Route>

            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
