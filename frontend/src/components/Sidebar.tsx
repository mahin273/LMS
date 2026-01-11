import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, Trophy, Settings, Shield, LogOut, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['student', 'instructor', 'admin'] },
    { icon: BookOpen, label: 'Courses', href: '/courses', roles: ['student', 'instructor'] },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard', roles: ['student', 'instructor'] },
    { icon: Users, label: 'Manage Users', href: '/admin/users', roles: ['admin'] },
    { icon: Users, label: 'Students', href: '/admin/students', roles: ['admin'] },
    { icon: GraduationCap, label: 'Instructors', href: '/admin/instructors', roles: ['admin'] },
    { icon: BookOpen, label: 'All Courses', href: '/admin/courses', roles: ['admin'] },
    { icon: Shield, label: 'Logs', href: '/admin/logs', roles: ['admin'] },

    { icon: Settings, label: 'Settings', href: '/admin/settings', roles: ['admin'] },
    { icon: Users, label: 'Profile', href: '/profile', roles: ['student', 'instructor', 'admin'] },
];

export function SidebarContent() {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();

    const hasRole = (roles: string[]) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="px-6 py-4">
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">L</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">LMS</span>
                </Link>
            </div>
            <div className="flex-1 px-3 space-y-1 overflow-y-auto">
                {sidebarItems.map((item, index) => {
                    if (!hasRole(item.roles)) return null;

                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));



                    return (
                        <Link key={index} to={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 mb-1 font-medium",
                                    isActive ? "bg-secondary/50 text-secondary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t mt-auto">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{user?.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                </div>
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <div className="hidden border-r bg-card/30 backdrop-blur-xl md:flex md:w-64 md:flex-col h-screen sticky top-0">
            <SidebarContent />
        </div>
    );
}
