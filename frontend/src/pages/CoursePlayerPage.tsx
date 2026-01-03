import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Added useQueryClient
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Lock } from 'lucide-react'; // Need lucide-react icons

export default function CoursePlayerPage() {
    const { courseId, lessonId } = useParams(); // URL optionally has lessonId
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeLesson, setActiveLesson] = useState<any>(null);

    // 1. Fetch Course & Lessons
    const { data: courseData, isLoading } = useQuery({
        queryKey: ['course-content', courseId],
        queryFn: async () => {
            // We probably need a specialized endpoint that returns everything for the player
            // But let's chain for now or use the getLessons one
            const lessonsRes = await client.get(`/${courseId}/lessons`);
            // We also need the course details
            // TODO: Backend should probably expose GET /courses/:id
            // For now, let's assume getEnrolledCourses has it or we add a public/enrolled detail route
            // Hack: Just listing lessons is enough for functionality, title can wait
            return lessonsRes.data;
        }
    });

    // 2. Fetch User Progress
    // We need to know which lessons are completed
    // Let's add an endpoint or include it in the lessons response
    // Quick fix: GET /:courseId/progress

    // Actually, let's create a specialized hook later. 
    // For now, let's assume the lesson completion returns the full updated state or we refetch.

    const completeLessonMutation = useMutation({
        mutationFn: async (id: string) => {
            // The backend route is POST /api/lessons/:lessonId/complete bound to /api root in index.ts
            // Route path in lesson.routes.ts: router.post('/lessons/:lessonId/complete', ...)
            return client.post(`/lessons/${id}/complete`);
        },
        onSuccess: (data) => {
            // Show badge toast?
            if (data.data.progress) {
                // Update local state or refetch
            }
        }
    });

    useEffect(() => {
        if (courseData && courseData.length > 0) {
            if (!lessonId) {
                // Default to first lesson
                setActiveLesson(courseData[0]);
                navigate(`/courses/${courseId}/lessons/${courseData[0].id}`, { replace: true });
            } else {
                const found = courseData.find((l: any) => l.id === lessonId);
                if (found) setActiveLesson(found);
            }
        }
    }, [courseData, lessonId, courseId]); // Added dependencies

    if (isLoading) return <div className="p-8">Loading course content...</div>;

    return (
        <div className="flex h-[calc(100vh-65px)]">
            {/* Sidebar */}
            <div className="w-80 border-r bg-muted/10 overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Course Content</h2>
                </div>
                <div>
                    {courseData?.map((lesson: any, index: number) => (
                        <div
                            key={lesson.id}
                            onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                            className={cn(
                                "p-4 border-b cursor-pointer hover:bg-muted/50 flex items-center gap-3 transition-colors",
                                activeLesson?.id === lesson.id && "bg-primary/5 border-l-4 border-l-primary"
                            )}
                        >
                            <div className="text-muted-foreground">
                                <Circle size={16} /> {/* Replace with CheckCircle if complete */}
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                                {lesson.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {activeLesson ? (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-4">{activeLesson.title}</h1>
                            <div className="prose dark:prose-invert max-w-none">
                                {/* Simple whitespace rendering for now, use ReactMarkdown later if needed */}
                                <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed">
                                    {activeLesson.content}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t">
                            <Button variant="outline" disabled={true}>Previous Lesson</Button>
                            <Button
                                size="lg"
                                onClick={() => completeLessonMutation.mutate(activeLesson.id)}
                                disabled={completeLessonMutation.isPending}
                            >
                                {completeLessonMutation.isPending ? 'Completing...' : 'Mark as Complete'}
                            </Button>
                            <Button variant="outline" disabled={true}>Next Lesson</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select a lesson to start learning
                    </div>
                )}
            </div>
        </div>
    );
}
