import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Activity, Database, Server, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await client.get('/admin/stats');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted"></div>
                    <div className="h-4 w-32 rounded bg-muted"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                    <p className="text-muted-foreground">System statistics and management.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-muted-foreground">System Online</span>
                </div>
            </div>

            <Separator className="bg-border/50" />

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.counts?.users || '-'}</div>
                        <p className="text-xs text-muted-foreground">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.counts?.courses || '-'}</div>
                        <p className="text-xs text-muted-foreground">Total courses available</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500 capitalize">{stats?.systemStatus || 'Unknown'}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Database className="h-3 w-3" /> Ver: {stats?.dbVersion?.substring(0, 15)}...
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart Section */}
                <Card className="col-span-1 lg:col-span-4 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                        <CardDescription>New users and courses over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.chartData || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="New Users" />
                                    <Bar dataKey="courses" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="New Courses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Panel */}
                <Card className="col-span-1 lg:col-span-3 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Management Console</CardTitle>
                        <CardDescription>Quick access to administrative tools</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/admin/students" className="contents">
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
                                    <Users className="h-6 w-6 text-primary" />
                                    <span>Students</span>
                                </Button>
                            </Link>
                            <Link to="/admin/instructors" className="contents">
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
                                    <Users className="h-6 w-6 text-secondary" />
                                    <span>Instructors</span>
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">System Tools</h4>
                            <Link to="/admin/courses">
                                <Button className="w-full justify-between" variant="secondary">
                                    <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Manage Courses</span>
                                    <ArrowRight className="h-4 w-4 opacity-50" />
                                </Button>
                            </Link>
                            <Link to="/admin/logs">
                                <Button className="w-full justify-between" variant="ghost">
                                    <span className="flex items-center gap-2"><Server className="h-4 w-4" /> System Logs</span>
                                    <ArrowRight className="h-4 w-4 opacity-50" />
                                </Button>
                            </Link>
                            <Link to="/admin/settings">
                                <Button className="w-full justify-between" variant="ghost">
                                    <span className="flex items-center gap-2"><Database className="h-4 w-4" /> Database Settings</span>
                                    <ArrowRight className="h-4 w-4 opacity-50" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
