import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Clock, Users, Star, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CourseDetailsPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch course details
    const { data: course, isLoading } = useQuery({
        queryKey: ['course-details', courseId],
        queryFn: async () => {
            // Workaround: fetch all and find, as per previous logic.
            const res = await client.get('/courses');
            return res.data.find((c: any) => c.id === courseId);
        }
    });

    const enrollMutation = useMutation({
        mutationFn: async () => {
            await client.post(`/courses/${courseId}/enroll`);
        },
        onSuccess: () => {
            toast.success('Enrolled successfully!');
            queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
            navigate(`/courses/${courseId}`);
        },
        onError: () => {
            toast.error('Failed to enroll.');
        }
    });

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-primary/20"></div>
                <p className="text-muted-foreground animate-pulse">Loading course info...</p>
            </div>
        </div>
    );

    if (!course) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground mb-8">Course not found.</p>
                <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
        </div>
    );

    const isStudent = user?.role === 'student';

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Hero Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Hero Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 uppercase tracking-widest text-[10px] py-1 px-3">
                                Premium Course
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 leading-tight">
                                {course.title}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                                {course.description || 'Master this subject with our comprehensive curriculum designed for all skill levels.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50">
                                <Users size={16} className="text-blue-500" />
                                {course.studentCount} Students Enrolled
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50">
                                <Star size={16} className="text-amber-500 fill-amber-500" />
                                {course.averageRating || 'New'} Rating
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50">
                                <Clock size={16} className="text-green-500" />
                                Self-paced
                            </div>
                        </div>

                        <div className="pt-8">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-primary" />
                                What you'll learn
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Comprehensive understanding of core concepts",
                                    "Practical, hands-on projects and assignments",
                                    "Best practices and industry standards",
                                    "Advanced techniques for real-world application",
                                    "Certificate of completion upon finishing",
                                    "Lifetime access to course materials"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/30">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Enrollment Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                                <CardHeader className="text-center pb-2 pt-8">
                                    <Badge className="w-fit mx-auto mb-4 bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                                        Join Today
                                    </Badge>
                                    <CardTitle className="text-3xl font-bold">Free Access</CardTitle>
                                    <CardDescription>Enroll now and start learning immediately.</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6 pt-6">
                                    {isStudent ? (
                                        <Button
                                            size="lg"
                                            className="w-full text-lg h-14 shadow-lg shadow-primary/25 animate-pulse-hover"
                                            onClick={() => enrollMutation.mutate()}
                                            disabled={enrollMutation.isPending}
                                        >
                                            {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                                            {!enrollMutation.isPending && <ArrowRight className="ml-2 h-5 w-5" />}
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" className="w-full h-12" disabled>
                                            {user?.role === 'instructor' ? 'Instructors cannot enroll' :
                                                user?.role === 'admin' ? 'Admins cannot enroll' :
                                                    'Log in as Student to Enroll'}
                                        </Button>
                                    )}

                                    <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t border-border/50">
                                        <div className="flex justify-between">
                                            <span>Instructor</span>
                                            <span className="font-medium text-foreground">{course.instructor?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Language</span>
                                            <span className="font-medium text-foreground">English</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Access</span>
                                            <span className="font-medium text-foreground">Mobile & Desktop</span>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-4 rounded-lg flex items-center gap-3 text-xs text-muted-foreground justify-center">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>30-Day Money-Back Guarantee (Mock)</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
