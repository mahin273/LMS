import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Activity, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await client.get('/admin/stats');
            return res.data;
        }
    });

    if (isLoading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.counts?.users || '-'}</div>
                        <p className="text-xs text-muted-foreground">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.counts?.courses || '-'}</div>
                        <p className="text-xs text-muted-foreground">Total courses available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats?.systemStatus || 'Unknown'}</div>
                        <p className="text-xs text-muted-foreground">DB: {stats?.dbVersion}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.chartData || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip />
                                    <Bar dataKey="users" fill="#adfa1d" radius={[4, 4, 0, 0]} name="New Users" />
                                    <Bar dataKey="courses" fill="#2563eb" radius={[4, 4, 0, 0]} name="New Courses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Link to="/admin/students">
                                <Button className="w-full" variant="outline">Students</Button>
                            </Link>
                            <Link to="/admin/instructors">
                                <Button className="w-full" variant="outline">Instructors</Button>
                            </Link>
                        </div>
                        <Link to="/admin/courses">
                            <Button className="w-full mb-2" variant="outline">Manage Courses</Button>
                        </Link>
                        <Link to="/admin/logs">
                            <Button className="w-full mb-2" variant="outline">System Logs</Button>
                        </Link>
                        <Link to="/admin/settings">
                            <Button className="w-full" variant="outline">Database Settings</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
