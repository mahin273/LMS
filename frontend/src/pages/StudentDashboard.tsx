import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Trophy, CheckCircle, Clock, Play, Calendar, ArrowRight, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
    const { data: courses, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['enrolled-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/enrolled');
            return res.data;
        }
    });

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await client.get('/users/profile');
            return res.data;
        }
    });

    const { data: activity } = useQuery({
        queryKey: ['student-activity'],
        queryFn: async () => {
            const res = await client.get('/users/activity');
            return res.data;
        }
    });

    const { data: deadlines } = useQuery({
        queryKey: ['student-deadlines'],
        queryFn: async () => {
            const res = await client.get('/users/deadlines');
            return res.data;
        }
    });



    if (isLoadingCourses) {
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back! Continue where you left off.
                    </p>
                </div>
                <Link to="/courses">
                    <Button className="shadow-lg shadow-primary/20">Find a Course</Button>
                </Link>
            </div>



            <Separator className="bg-border/50" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Active subscriptions</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {courses ? courses.filter((c: any) => c.progress === 100).length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Courses finished</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {courses ? courses.filter((c: any) => c.progress < 100).length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently learning</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Content Area: Courses */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Activity Graph */}
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-primary" />
                                Weekly Activity
                            </CardTitle>
                            <CardDescription>Your learning streak over the last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activity || []}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderColor: '#333', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="lessons" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Lessons Completed" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            My Learning
                        </h2>
                    </div>

                    {(!courses || courses.length === 0) ? (
                        <Card className="border-dashed border-2 bg-muted/10">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium mb-2">No courses yet</p>
                                <p className="text-sm max-w-sm mb-6">Enrolling in a course is the first step to earning badges and gaining new skills.</p>
                                <Link to="/courses">
                                    <Button variant="outline">Browse Catalog</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {courses.map((course: any) => (
                                <CourseCard key={course.id} course={course} isEnrolled={true} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Area: Stats & Badges */}
                <div className="space-y-6">

                    {/* Upcoming Deadlines */}
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5 text-red-400" />
                                Deadlines
                            </CardTitle>
                            <CardDescription>Assignments due soon</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {!deadlines || deadlines.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines 🎉</p>
                            ) : (
                                deadlines.map((d: any) => (
                                    <div key={d.id} className="flex flex-col gap-1 border-b border-border/50 last:border-0 pb-3 last:pb-0 min-w-0">
                                        <span className="font-medium text-sm truncate">{d.title}</span>
                                        <span className="text-xs text-muted-foreground truncate">{d.course?.title}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <BadgeDisplay type="BRONZE" count={0} className="w-2 h-2 rounded-full hidden" />
                                            <span className="text-xs font-mono bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">
                                                {new Date(d.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Achievements
                            </CardTitle>
                            <CardDescription>
                                Earn badges by completing courses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profile?.badges && profile.badges.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.values(profile.badges.reduce((acc: any, badge: any) => {
                                        acc[badge.type] = acc[badge.type] || { ...badge, count: 0 };
                                        acc[badge.type].count += 1;
                                        return acc;
                                    }, {})).map((badge: any) => (
                                        <div key={badge.id} className="flex flex-col items-center p-3 bg-background/50 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                                            <BadgeDisplay type={badge.type} count={badge.count} className="w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                                    <p className="text-xs text-muted-foreground">Complete your first lesson to unlock achievements!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Pro Tip</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Consistency is key! Try to complete at least one lesson every day to maintain your streak.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
