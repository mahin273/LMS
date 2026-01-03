import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import CreateCoursePage from './pages/CreateCoursePage'
import EditCoursePage from './pages/EditCoursePage'
import CoursePlayerPage from './pages/CoursePlayerPage'
import { isAuthenticated } from './lib/auth'

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

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/courses/new" element={
              <ProtectedRoute>
                <CreateCoursePage />
              </ProtectedRoute>
            } />
            <Route path="/courses/:courseId/edit" element={
              <ProtectedRoute>
                <EditCoursePage />
              </ProtectedRoute>
            } />

            <Route path="/courses/:courseId" element={
              <ProtectedRoute>
                <CoursePlayerPage />
              </ProtectedRoute>
            } />
            <Route path="/courses/:courseId/lessons/:lessonId" element={
              <ProtectedRoute>
                <CoursePlayerPage />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
