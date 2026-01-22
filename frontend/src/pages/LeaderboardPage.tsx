import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Medal, Trophy, Star, Crown } from 'lucide-react';

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

    const BadgeIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'BRONZE': return <Medal className="w-4 h-4 text-amber-600" />;
            case 'SILVER': return <Trophy className="w-4 h-4 text-slate-400" />;
            case 'GOLD': return <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
            case 'MASTER': return <Crown className="w-4 h-4 text-purple-500 fill-purple-500" />;
            default: return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span>🏆</span> Student Leaderboard
            </h1>
            <p className="text-muted-foreground mb-6">Ranked by total points earned from badges</p>

            {/* Points Legend */}
            <Card className="mb-6 bg-muted/30">
                <CardContent className="py-4">
                    <div className="flex flex-wrap gap-4 justify-center text-sm">
                        <div className="flex items-center gap-2">
                            <Medal className="w-4 h-4 text-amber-600" />
                            <span>Bronze = 25 pts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-slate-400" />
                            <span>Silver = 50 pts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>Gold = 100 pts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-purple-500 fill-purple-500" />
                            <span>Master = 200 pts</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Top Students</CardTitle>
                    <CardDescription>Complete courses to earn badges and climb the ranks!</CardDescription>
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
                                        <div className="flex items-center gap-2 mt-1">
                                            {user.badgeBreakdown?.MASTER > 0 && (
                                                <span className="flex items-center gap-1 text-xs">
                                                    <BadgeIcon type="MASTER" />
                                                    x{user.badgeBreakdown.MASTER}
                                                </span>
                                            )}
                                            {user.badgeBreakdown?.GOLD > 0 && (
                                                <span className="flex items-center gap-1 text-xs">
                                                    <BadgeIcon type="GOLD" />
                                                    x{user.badgeBreakdown.GOLD}
                                                </span>
                                            )}
                                            {user.badgeBreakdown?.SILVER > 0 && (
                                                <span className="flex items-center gap-1 text-xs">
                                                    <BadgeIcon type="SILVER" />
                                                    x{user.badgeBreakdown.SILVER}
                                                </span>
                                            )}
                                            {user.badgeBreakdown?.BRONZE > 0 && (
                                                <span className="flex items-center gap-1 text-xs">
                                                    <BadgeIcon type="BRONZE" />
                                                    x{user.badgeBreakdown.BRONZE}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-xs">
                                        {user.badgeCount} Badges
                                    </Badge>
                                    <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
                                        {user.totalPoints} pts
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
