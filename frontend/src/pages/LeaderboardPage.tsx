import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LeaderboardPage() {
    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const res = await client.get('/gamification/leaderboard');
            return res.data;
        }
    });

    if (isLoading) return <div className="p-8">Loading leaderboard...</div>;

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `#${index + 1}`;
        }
    };

    const getRowStyle = (index: number) => {
        switch (index) {
            case 0: return 'bg-yellow-500/10 border-yellow-500/50';
            case 1: return 'bg-gray-400/10 border-gray-400/50';
            case 2: return 'bg-amber-700/10 border-amber-700/50';
            default: return '';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span>🏆</span> Student Leaderboard
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Top Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {leaderboard?.map((user: any, index: number) => (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-4 rounded-lg border ${getRowStyle(index)} hover:bg-muted/50 transition-colors`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl font-bold w-12 text-center">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-lg">{user.name}</span>
                                        <span className="text-sm text-muted-foreground">{user.role}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-base px-3 py-1">
                                        {user.badgeCount} Badges
                                    </Badge>
                                </div>
                            </div>
                        ))}

                        {leaderboard?.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No badges awarded yet. Be the first!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
