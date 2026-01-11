import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Users, BookOpen, MoreVertical, Edit, UserCheck, Star, Clock, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export default function InstructorDashboard() {
    const queryClient = useQueryClient();
    const { data: courses, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['instructor-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/instructor');
            return res.data;
        }
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['instructor-stats'],
        queryFn: async () => {
            const res = await client.get('/courses/instructor/stats');
            return res.data;
        }
    });

    const isLoading = isLoadingCourses || isLoadingStats;

    const deleteMutation = useMutation({
        mutationFn: async (courseId: string) => {
            await client.delete(`/courses/${courseId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
            toast.success("Course deleted");
        },
        onError: () => {
            toast.error("Failed to delete course");
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Instructor Portal
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your courses and track student progress.
                    </p>
                </div>
                <Link to="/courses/new">
                    <Button className="shadow-lg shadow-primary/20 gap-2">
                        <Plus className="h-4 w-4" /> Create Course
                    </Button>
                </Link>
            </div>

            <Separator className="bg-border/50" />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">Across all courses</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
                        <p className="text-xs text-muted-foreground">Active & Drafts</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingGrading || 0}</div>
                        <p className="text-xs text-muted-foreground">Submissions to review</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.avgRating || 0}</div>
                        <p className="text-xs text-muted-foreground">Student feedback</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area (Courses + Chart) uses 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Enrollment Chart */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" /> New Enrollments (Last 7 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.chartData || []}>
                                    <defs>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="students" stroke="#8884d8" fillOpacity={1} fill="url(#colorStudents)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Managed Courses
                        </h2>
                        {courses?.length > 0 && (
                            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                {courses.length} Total
                            </span>
                        )}
                    </div>

                    {(!courses || courses.length === 0) ? (
                        <Card className="border-dashed border-2 bg-muted/10">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                                <h3 className="text-lg font-bold mb-2">No courses created</h3>
                                <p className="text-sm max-w-sm mb-6">Start sharing your knowledge by creating your first course today.</p>
                                <Link to="/courses/new">
                                    <Button>Create Course</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course: any) => (
                                <Card key={course.id} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                                    <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-600" />
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="leading-tight text-lg line-clamp-2 min-h-[3.5rem]">
                                                {course.title}
                                            </CardTitle>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link to={`/courses/${course.id}/edit`}>
                                                        <DropdownMenuItem>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            if (confirm(`Delete "${course.title}"?`)) {
                                                                deleteMutation.mutate(course.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <CardDescription className="line-clamp-2 mt-2">
                                            {course.description || "No description provided."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{course.students?.length || 0} Students</span>
                                            </div>
                                            {/* Add more stats here if available, e.g. rating, revenue */}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Link to={`/courses/${course.id}/edit`} className="w-full">
                                            <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                Manage Content
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Column (Activity Feed) */}
                <div className="space-y-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-fit">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                            <CardDescription>Latest student actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats?.activityFeed && stats.activityFeed.length > 0 ? (
                                    stats.activityFeed.map((item: any, i: number) => (
                                        <div key={i} className="flex gap-3 text-sm items-start">
                                            <div className="mt-0.5 min-w-[32px] min-h-[32px] rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {item.type === 'enrollment' ? 'EN' : 'SUB'}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="leading-tight">
                                                    <span className="font-semibold text-foreground/80">{item.studentName}</span>
                                                    <span className="text-muted-foreground mr-1"> {item.type === 'enrollment' ? 'joined' : 'submitted'}</span>
                                                    <span className="text-primary/80 block text-xs mt-0.5 font-medium">{item.courseTitle} {item.assignmentTitle ? `- ${item.assignmentTitle}` : ''}</span>
                                                </p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                    {new Date(item.createdAt || item.submittedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No recent activity
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}
