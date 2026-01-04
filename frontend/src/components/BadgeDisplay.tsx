import { Medal, Trophy, Star, Crown } from 'lucide-react';

interface BadgeProps {
    type: 'BRONZE' | 'SILVER' | 'GOLD' | 'MASTER';
    className?: string;
    showName?: boolean;
    count?: number;
}

export function BadgeDisplay({ type, className = '', showName = true, count = 1 }: BadgeProps) {
    const config = {
        BRONZE: {
            color: 'bg-amber-100 border-amber-500 text-amber-700',
            icon: <Medal className="w-6 h-6" />,
            label: 'Bronze Scholar'
        },
        SILVER: {
            color: 'bg-slate-100 border-slate-500 text-slate-700',
            icon: <Trophy className="w-6 h-6" />,
            label: 'Silver Achiever'
        },
        GOLD: {
            color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
            icon: <Star className="w-6 h-6 fill-current" />,
            label: 'Gold Master'
        },
        MASTER: {
            color: 'bg-purple-100 border-purple-500 text-purple-700',
            icon: <Crown className="w-6 h-6 fill-current" />,
            label: 'Grand Master'
        },
    };

    const style = config[type] || config['BRONZE'];

    return (
        <div className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 ${style.color} ${className}`}>
            {count > 1 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {count}x
                </span>
            )}
            <div className="mb-1">{style.icon}</div>
            {showName && <span className="text-xs font-bold uppercase tracking-wide">{style.label}</span>}
        </div>
    );
}
