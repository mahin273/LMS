import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link to="/dashboard" className="text-xl font-bold hover:opacity-80 transition-opacity">
                            LMS
                        </Link>
                        <nav className="hidden md:flex gap-4 text-sm font-medium">
                            <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
                            <Link to="/courses" className="hover:text-primary">Courses</Link>
                            <Link to="/leaderboard" className="hover:text-primary">Leaderboard</Link>
                            {/* Add more global links here if needed */}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                {user.name} ({user.role})
                            </span>
                        )}
                        <Link to="/profile">
                            <Button variant="outline" size="sm">Profile</Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
