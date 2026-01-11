import { motion, useMotionValue } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    UserCircle,
    LogOut,
    Search,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function FloatingDock() {
    const { logout } = useAuth();
    const location = useLocation();

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-4 px-4 py-3 bg-background/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl shadow-black/20">
                <DockIcon to="/dashboard" icon={LayoutDashboard} label="Home" isActive={location.pathname === '/dashboard'} />
                <DockIcon to="/courses" icon={BookOpen} label="Courses" isActive={location.pathname === '/courses'} />

                {/* Divider */}
                <div className="w-[1px] h-8 bg-white/20 dark:bg-white/10 mx-1" />

                <DockIcon to="/leaderboard" icon={Trophy} label="Rank" isActive={location.pathname === '/leaderboard'} />
                <DockIcon to="/profile" icon={UserCircle} label="Profile" isActive={location.pathname === '/profile'} />

                {/* Search Trigger */}
                <div className="w-[1px] h-8 bg-white/20 dark:bg-white/10 mx-1" />

                <button className="relative group p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Search className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
                <button className="relative group p-2 rounded-full hover:bg-white/10 transition-colors" onClick={logout}>
                    <LogOut className="w-6 h-6 text-muted-foreground group-hover:text-destructive transition-colors" />
                </button>
            </div>
        </div>
    );
}

function DockIcon({ to, icon: Icon, label, isActive }: { to: string; icon: any; label: string; isActive: boolean }) {
    const mouseX = useMotionValue(Infinity);

    return (
        <Link to={to}>
            <motion.div
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                    isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
            >
                <Icon className="w-6 h-6" />

                {/* Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-sm">
                    {label}
                </span>

                {isActive && (
                    <span className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full box-content border-2 border-background" />
                )}
            </motion.div>
        </Link>
    );
}
