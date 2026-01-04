import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Circle, FileText, CheckCircle, Upload, Star, Lock, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

function RateCourseForm({ courseId, onSuccess }: { courseId: string, onSuccess?: () => void }) {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            return client.post(`/courses/${courseId}/rate`, { rating, review });
        },
        onSuccess: () => {
            toast.success("Rating submitted!");
            queryClient.invalidateQueries({ queryKey: ['course-details'] });
            onSuccess?.();
        },
        onError: () => {
            toast.error("Failed to submit rating");
        }
    });

    return (
        <div className="space-y-4 py-4">
            <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={cn("p-1 transition-colors hover:scale-110", rating >= star ? "text-amber-500" : "text-slate-300")}
                    >
                        <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                <Label>Write a Review (Optional)</Label>
                <Textarea placeholder="What did you like about this course?" value={review} onChange={(e) => setReview(e.target.value)} />
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
        </div>
    );
}

export default function CoursePlayerPage() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State to track active item (Lesson or Assignment)
    // We can use a discriminatory union type concept or just check properties
    const [activeItem, setActiveItem] = useState<any>(null);
    const [activeType, setActiveType] = useState<'lesson' | 'assignment'>('lesson');
    const [open, setOpen] = useState(false);

    // 1. Fetch Lessons
    const { data: lessons, isLoading: isLoadingLessons } = useQuery({
        queryKey: ['course-content', courseId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/lessons`);
            return res.data;
        }
    });

    // 2. Fetch Assignments
    const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
        queryKey: ['course-assignments', courseId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/assignments`);
            return res.data;
        }
    });

    // Initialize Active Item
    useEffect(() => {
        if (assignments && lessons) {
            // If URL has lessonId, try to find it in lessons first
            // Note: URL structure is currently /courses/:courseId/lessons/:lessonId
            // If we want deep linking for assignments, we need a route /courses/:courseId/assignments/:assignmentId or similar
            // For now, let's keep it simple. If lessonId exists, it's a lesson.
            // If we want to click an assignment, we might change state without changing URL or add a query param ?assignment=ID

            if (lessonId) {
                const foundLesson = lessons.find((l: any) => l.id === lessonId);
                if (foundLesson) {
                    setActiveItem(foundLesson);
                    setActiveType('lesson');
                }
            } else if (lessons.length > 0) {
                // Default to first lesson if no ID
                setActiveItem(lessons[0]);
                setActiveType('lesson');
                navigate(`/courses/${courseId}/lessons/${lessons[0].id}`, { replace: true });
            }
        }
    }, [lessons, assignments, lessonId, courseId, navigate]);


    const completeLessonMutation = useMutation({
        mutationFn: async (id: string) => {
            return client.post(`/lessons/${id}/complete`);
        },
        onSuccess: () => {
            toast.success("Lesson Completed!");
            queryClient.invalidateQueries({ queryKey: ['course-content', courseId] });
        }
    });

    // Assignment Submission Logic
    const [uploading, setUploading] = useState(false);
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);

    const submitAssignmentMutation = useMutation({
        mutationFn: async ({ id, fileUrl }: { id: string, fileUrl: string }) => {
            return client.post(`/courses/${courseId}/assignments/${id}/submit`, { fileUrl });
        },
        onSuccess: () => {
            toast.success("Assignment Submitted!");
            // Refetch assignments to show new status if we had that data, or just assume success state in UI
            setSubmissionFile(null);
            // In a real app we would refetch 'my-submission' for this assignment
        }
    });

    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submissionFile || !activeItem) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', submissionFile);

        try {
            const uploadRes = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileUrl = uploadRes.data.url;
            await submitAssignmentMutation.mutateAsync({ id: activeItem.id, fileUrl });
        } catch (error) {
            console.error(error);
            toast.error("Submission failed");
        } finally {
            setUploading(false);
        }
    };


    if (isLoadingLessons || isLoadingAssignments) return <div className="p-8">Loading course content...</div>;

    return (
        <div className="flex h-[calc(100vh-65px)]">
            {/* Sidebar */}
            <div className="w-80 border-r bg-muted/10 overflow-y-auto flex-shrink-0">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Course Content</h2>
                </div>

                <div className="p-4 border-b space-y-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                                ⭐ Rate This Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Rate this Course</DialogTitle>
                                <DialogDescription>Share your feedback with others.</DialogDescription>
                            </DialogHeader>
                            <RateCourseForm courseId={courseId!} onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Lessons Section */}
                <div className="py-2">
                    <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lessons</h3>
                    {lessons?.map((lesson: any, index: number) => {
                        const isLocked = lesson.isLocked;
                        return (
                            <div
                                key={lesson.id}
                                onClick={() => {
                                    if (isLocked) {
                                        toast.error("Complete previous lessons to unlock this one.");
                                        return;
                                    }
                                    setActiveItem(lesson);
                                    setActiveType('lesson');
                                    navigate(`/courses/${courseId}/lessons/${lesson.id}`);
                                }}
                                className={cn(
                                    "p-3 px-4 cursor-pointer hover:bg-muted/50 flex items-center gap-3 transition-colors text-sm",
                                    activeType === 'lesson' && activeItem?.id === lesson.id && "bg-primary/5 border-l-4 border-l-primary",
                                    isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                )}
                            >
                                <div className="text-muted-foreground">
                                    {isLocked ? <Lock size={14} /> : lesson.isCompleted ? <CheckCircle size={14} className="text-green-500" /> : <PlayCircle size={14} />}
                                </div>
                                <span className={cn("truncate", isLocked && "text-muted-foreground")}>{index + 1}. {lesson.title}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Assignments Section */}
                {assignments?.length > 0 && (
                    <div className="py-2 border-t">
                        <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignments</h3>
                        {assignments.map((assignment: any) => (
                            <div
                                key={assignment.id}
                                onClick={() => {
                                    setActiveItem(assignment);
                                    setActiveType('assignment');
                                    // Optionally update URL or just keep generic
                                    // navigate(`/courses/${courseId}/assignments/${assignment.id}`); // validation needed
                                }}
                                className={cn(
                                    "p-3 px-4 cursor-pointer hover:bg-muted/50 flex items-center gap-3 transition-colors text-sm",
                                    activeType === 'assignment' && activeItem?.id === assignment.id && "bg-primary/5 border-l-4 border-l-primary"
                                )}
                            >
                                <div className="text-muted-foreground">
                                    <FileText size={14} />
                                </div>
                                <span className="truncate">{assignment.title}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {activeItem ? (
                    activeType === 'lesson' ? (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-4">{activeItem.title}</h1>

                                {activeItem.videoUrl && (
                                    <div className="mb-6 aspect-video rounded-lg overflow-hidden border bg-black/5">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={activeItem.videoUrl.replace('watch?v=', 'embed/')}
                                            title="Lesson Video"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                )}

                                <div className="prose dark:prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed">
                                        {activeItem.content}
                                    </div>
                                </div>
                                {activeItem.fileUrl && (
                                    <div className="mt-6">
                                        <a href={activeItem.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline">Download Material</Button>
                                        </a>
                                    </div>
                                )}

                                {/* Linked Assignments */}
                                {assignments?.filter((a: any) => a.lessonId === activeItem.id).length > 0 && (
                                    <div className="mt-8 pt-6 border-t">
                                        <h3 className="text-xl font-semibold mb-4">Assignments for this Lesson</h3>
                                        <div className="grid gap-3">
                                            {assignments.filter((a: any) => a.lessonId === activeItem.id).map((assignment: any) => (
                                                <div
                                                    key={assignment.id}
                                                    className="p-4 border rounded-md flex justify-between items-center hover:bg-muted/30 cursor-pointer"
                                                    onClick={() => {
                                                        setActiveItem(assignment);
                                                        setActiveType('assignment');
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary/10 p-2 rounded text-primary">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{assignment.title}</p>
                                                            <p className="text-xs text-muted-foreground">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="secondary">View</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-8 border-t">
                                <Button variant="outline" disabled>Previous</Button>
                                <Button
                                    size="lg"
                                    onClick={() => completeLessonMutation.mutate(activeItem.id)}
                                    disabled={completeLessonMutation.isPending}
                                >
                                    {completeLessonMutation.isPending ? 'Completing...' : 'Mark as Complete'}
                                </Button>
                                <Button variant="outline" disabled>Next</Button>
                            </div>
                        </div>
                    ) : (
                        /* Assignment View */
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold">{activeItem.title}</h1>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline">Assignment</Badge>
                                    {activeItem.dueDate && <Badge variant="secondary">Due: {new Date(activeItem.dueDate).toLocaleDateString()}</Badge>}
                                </div>
                            </div>

                            <div className="prose dark:prose-invert bg-card p-6 rounded-md border text-sm">
                                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                                <p className="whitespace-pre-wrap">{activeItem.description}</p>
                            </div>

                            <div className="bg-muted/20 p-6 rounded-md border space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Upload size={18} />
                                    Your Submission
                                </h3>

                                {/* 
                                     TODO: Ideally we fetch the existing submission here to show status.
                                     For now, just the upload form.
                                 */}

                                <form onSubmit={handleSubmission} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Upload your work (PDF, Zip, etc..)</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={uploading || submitAssignmentMutation.isPending}>
                                        {uploading ? 'Uploading...' : submitAssignmentMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select a lesson or assignment to start
                    </div>
                )}
            </div>
        </div >
    );
}
