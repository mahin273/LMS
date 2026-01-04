import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Trophy } from 'lucide-react';

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

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Content Area: Courses */}
                <div className="lg:col-span-3 space-y-6">
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
