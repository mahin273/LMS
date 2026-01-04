import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function CourseDetailsPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch course details (public info)
    const { data: course, isLoading } = useQuery({
        queryKey: ['course-details', courseId],
        queryFn: async () => {
            // We need a public endpoint for single course details or we filter from public courses
            // For now, let's assume we can fetch it via /courses
            // Wait, getPublicCourses returns ALL public courses. We don't have a getPublicCourseById.
            // We should probably add one, or reuse the list and find. 
            // Ideally fetching the list is okay for small apps, but inefficient.
            // Let's rely on fetching access to individual course route. 
            // Actually, 'getLessons' is secured, but 'getCourse' might not be?
            // Let's check backend course controller. We don't have 'getCourseById' public endpoint.
            // We only have public `getPublicCourses` (all).
            // Temporary workaround: Fetch all public courses and find.
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
            // Redirect to player
            navigate(`/courses/${courseId}`);
        },
        onError: () => {
            toast.error('Failed to enroll.');
        }
    });

    if (isLoading) return <div className="p-8 text-center">Loading course info...</div>;
    if (!course) return <div className="p-8 text-center">Course not found.</div>;

    const isStudent = user?.role === 'student';

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                            <CardDescription className="text-lg">Instructor: {course.instructor?.name}</CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm">
                        {course.studentCount > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                                <span>👥</span>
                                <span className="font-medium">{course.studentCount} Students</span>
                            </div>
                        )}
                        {course.averageRating && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full">
                                <span>⭐</span>
                                <span className="font-bold">{course.averageRating}</span>
                                <span className="text-amber-600/80 font-normal">Average Rating</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="prose dark:prose-invert">
                        <h3 className="text-xl font-semibold mb-2">About this Course</h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {course.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t">
                        <div className="text-sm text-muted-foreground">
                            {/* Placeholder for stats like "12 Lessons" if we had them in public view */}
                        </div>

                        {isStudent ? (
                            <Button size="lg" onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
                                {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                            </Button>
                        ) : (
                            <Button variant="outline" disabled>
                                Log in as Student to Enroll
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
