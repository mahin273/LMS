
interface BadgeProps {
    type: 'BRONZE' | 'SILVER' | 'GOLD' | 'MASTER';
}

export function BadgeDisplay({ type }: BadgeProps) {
    const colors = {
        BRONZE: 'bg-amber-600 border-amber-800 text-white',
        SILVER: 'bg-slate-400 border-slate-600 text-white',
        GOLD: 'bg-yellow-400 border-yellow-600 text-yellow-900',
        MASTER: 'bg-purple-600 border-purple-900 text-white',
    };

    return (
        <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border-2 ${colors[type]} shadow-sm`}>
            {type}
        </div>
    );
}
