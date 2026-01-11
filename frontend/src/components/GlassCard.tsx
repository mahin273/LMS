import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    delay?: number;
}

export function GlassCard({ children, className, hoverEffect = true, delay = 0 }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-xl",
                hoverEffect && "hover:bg-white/15 dark:hover:bg-black/30 transition-colors duration-300",
                className
            )}
        >
            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Noise Texture (Optional, adds realism) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

            <div className="relative z-10 p-6">
                {children}
            </div>
        </motion.div>
    );
}

export function GlassHeader({ title, subtitle, action }: { title: string, subtitle?: string, action?: ReactNode }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h3 className="text-lg font-semibold text-foreground/90 tracking-tight">{title}</h3>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

export function GlassStat({ label, value, trend, icon: Icon }: { label: string, value: string, trend?: string, icon?: any }) {
    return (
        <div className="flex items-center gap-4">
            {Icon && (
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div>
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
                    {trend && <span className="text-xs text-primary font-bold">{trend}</span>}
                </div>
            </div>
        </div>
    );
}
