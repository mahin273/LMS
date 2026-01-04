import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    Circle, FileText, CheckCircle2, Upload, Star, Lock, PlayCircle,
    Menu, X, ChevronLeft, ChevronRight, Download, MessageSquare,
    Layout
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

// Custom ScrollArea component since we might not have the shadcn one installed yet
// If we entered `npx shadcn-ui@latest add scroll-area` it would be better, but we can mock it with a div
function CustomScrollArea({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={cn("overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/30", className)}>
            {children}
        </div>
    );
}

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
        <div className="space-y-6 py-4">
            <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={cn("p-1 transition-all hover:scale-110 focus:outline-none", rating >= star ? "text-amber-500" : "text-muted-foreground/30")}
                    >
                        <Star size={32} fill={rating >= star ? "currentColor" : "none"} className="drop-shadow-sm" />
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                <Label>Write a Review (Optional)</Label>
                <Textarea
                    placeholder="What did you like about this course?"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="bg-muted/50 resize-none min-h-[100px]"
                />
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

    const [activeItem, setActiveItem] = useState<any>(null);
    const [activeType, setActiveType] = useState<'lesson' | 'assignment'>('lesson');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [openRating, setOpenRating] = useState(false);

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
            if (lessonId) {
                const foundLesson = lessons.find((l: any) => l.id === lessonId);
                if (foundLesson) {
                    setActiveItem(foundLesson);
                    setActiveType('lesson');
                }
            } else if (lessons.length > 0) {
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
            setSubmissionFile(null);
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

    if (isLoadingLessons || isLoadingAssignments) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-primary/20"></div>
                    <p className="text-muted-foreground animate-pulse">Loading course content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-background overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="flex h-16 items-center border-b bg-card/50 backdrop-blur-md px-4 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <h1 className="text-lg font-semibold truncate max-w-md">{activeItem?.title}</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 mr-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Progress: {Math.round((lessons?.filter((l: any) => l.isCompleted).length || 0) / (lessons?.length || 1) * 100)}%</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative bg-dot-pattern">
                    {/* Cinema Mode Gradient Overlay */}
                    <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-background to-transparent pointer-events-none" />

                    <div className="container mx-auto max-w-5xl py-8 px-4 md:px-8 space-y-8">
                        {activeItem ? (
                            activeType === 'lesson' ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                                    {activeItem.videoUrl ? (
                                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-border/50 bg-black/40 shadow-2xl relative group">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={activeItem.videoUrl.replace('watch?v=', 'embed/')}
                                                title="Lesson Video"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute inset-0 z-10"
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-border/50 bg-muted/20 flex items-center justify-center flex-col gap-4 shadow-inner">
                                            <FileText className="h-16 w-16 text-muted-foreground/30" />
                                            <p className="text-muted-foreground">This lesson has no video.</p>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight mb-2">{activeItem.title}</h1>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Lesson {lessons?.indexOf(activeItem) + 1}</Badge>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><PlayCircle className="h-3 w-3" /> Video Lesson</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant={activeItem.isCompleted ? "outline" : "default"}
                                                size="sm"
                                                onClick={() => completeLessonMutation.mutate(activeItem.id)}
                                                disabled={completeLessonMutation.isPending}
                                                className={cn(activeItem.isCompleted && "text-green-500 border-green-500/30 hover:bg-green-500/10")}
                                            >
                                                {completeLessonMutation.isPending ? 'Marking...' : activeItem.isCompleted ? 'Completed' : 'Mark Complete'}
                                                {activeItem.isCompleted && <CheckCircle2 className="ml-2 h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <Tabs defaultValue="overview" className="w-full">
                                        <TabsList className="bg-muted/50 w-full justify-start rounded-lg p-1 h-auto">
                                            <TabsTrigger value="overview" className="rounded-md py-2 px-4">Overview</TabsTrigger>
                                            <TabsTrigger value="resources" className="rounded-md py-2 px-4">Resources</TabsTrigger>
                                            <TabsTrigger value="assignments" className="rounded-md py-2 px-4">Assignments ({assignments?.filter((a: any) => a.lessonId === activeItem.id).length})</TabsTrigger>
                                            <TabsTrigger value="discussion" className="rounded-md py-2 px-4">Discussion</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="overview" className="mt-6">
                                            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                                                <CardContent className="pt-6">
                                                    <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                                        <div className="whitespace-pre-wrap font-sans">
                                                            {activeItem.content || "No content provided for this lesson."}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="resources" className="mt-6">
                                            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                                                <CardContent className="pt-6">
                                                    {activeItem.fileUrl ? (
                                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                                                                    <FileText className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Lesson Material</p>
                                                                    <p className="text-xs text-muted-foreground">Downloadable resource</p>
                                                                </div>
                                                            </div>
                                                            <a href={activeItem.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="outline" size="sm">
                                                                    <Download className="h-4 w-4 mr-2" /> Download
                                                                </Button>
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <p className="text-center py-8 text-muted-foreground">No specific resources for this lesson.</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="assignments" className="mt-6">
                                            <div className="grid gap-4">
                                                {assignments?.filter((a: any) => a.lessonId === activeItem.id).length > 0 ? (
                                                    assignments.filter((a: any) => a.lessonId === activeItem.id).map((assignment: any) => (
                                                        <Card key={assignment.id}
                                                            className="border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-colors cursor-pointer"
                                                            onClick={() => {
                                                                setActiveItem(assignment);
                                                                setActiveType('assignment');
                                                            }}
                                                        >
                                                            <CardContent className="p-4 flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                                                                        <FileText className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium">{assignment.title}</h4>
                                                                        <p className="text-xs text-muted-foreground">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No Deadline'}</p>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="sm">View Assignment <ChevronRight className="h-4 w-4 ml-1" /></Button>
                                                            </CardContent>
                                                        </Card>
                                                    ))
                                                ) : (
                                                    <p className="text-center py-8 text-muted-foreground">No assignments linked to this lesson.</p>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="discussion" className="mt-6">
                                            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                                                <CardContent className="py-12 text-center text-muted-foreground">
                                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                    <p>Discussion forum coming soon.</p>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </Tabs>

                                </div>
                            ) : (
                                /* Assignment View */
                                <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => {
                                            // Go back to the linked lesson if possible, else first lesson
                                            const linkedLessonVal = lessons?.find((l: any) => l.id === activeItem.lessonId) || lessons?.[0];
                                            if (linkedLessonVal) {
                                                setActiveItem(linkedLessonVal);
                                                setActiveType('lesson');
                                            }
                                        }}>
                                            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Lesson
                                        </Button>
                                    </div>

                                    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-2xl">{activeItem.title}</CardTitle>
                                                    <CardDescription className="mt-2 flex items-center gap-2">
                                                        <Badge variant="outline" className="border-purple-500/30 text-purple-500">Assignment</Badge>
                                                        {activeItem.dueDate && <span className="text-xs">Due by: {new Date(activeItem.dueDate).toLocaleDateString()}</span>}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="prose dark:prose-invert bg-muted/30 p-4 rounded-lg border border-border/50 text-sm">
                                                <h3 className="text-base font-semibold mb-2">Instructions</h3>
                                                <p className="whitespace-pre-wrap leading-relaxed">{activeItem.description}</p>
                                            </div>

                                            <Separator className="bg-border/50" />

                                            <div className="bg-muted/10 p-6 rounded-lg border border-dashed border-border/80 space-y-4 text-center">
                                                <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                                                    <Upload size={24} />
                                                </div>
                                                <h3 className="font-semibold">Submit Your Work</h3>
                                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                                    Upload your completion file (PDF, Zip, or Docx).
                                                </p>

                                                <form onSubmit={handleSubmission} className="space-y-4 max-w-sm mx-auto">
                                                    <div className="space-y-2">
                                                        <Input
                                                            id="file"
                                                            type="file"
                                                            onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                                            required
                                                            className="bg-background/80"
                                                        />
                                                    </div>
                                                    <Button type="submit" disabled={uploading || submitAssignmentMutation.isPending} className="w-full">
                                                        {uploading ? 'Uploading...' : submitAssignmentMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
                                                    </Button>
                                                </form>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        ) : (
                            <div className="flex h-[50vh] items-center justify-center text-muted-foreground flex-col gap-4">
                                <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                                    <Layout className="h-8 w-8 opacity-20" />
                                </div>
                                <p>Select a lesson or assignment to start learning.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right/Left Sidebar - Course Curriculum */}
                <aside
                    className={cn(
                        "w-80 border-l bg-card/60 backdrop-blur-xl flex flex-col transition-all duration-300 absolute inset-y-0 right-0 z-40 transform md:relative md:transform-none",
                        !sidebarOpen && "translate-x-full md:mr-[-20rem]"
                    )}
                >
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Curriculum</h2>
                        <Button variant="ghost" size="icon" size-sm onClick={() => setSidebarOpen(false)} className="md:hidden">
                            <X className="h-4 w-4" />
                        </Button>
                        <Dialog open={openRating} onOpenChange={setOpenRating}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Rate Course">
                                    <Star className="h-4 w-4 text-amber-500" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Rate this Course</DialogTitle>
                                    <DialogDescription>Share your experience to help others.</DialogDescription>
                                </DialogHeader>
                                <RateCourseForm courseId={courseId!} onSuccess={() => setOpenRating(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <CustomScrollArea className="flex-1">
                        <div className="py-2">
                            {lessons?.map((lesson: any, index: number) => {
                                const isLocked = lesson.isLocked;
                                const isActive = activeType === 'lesson' && activeItem?.id === lesson.id;

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
                                            "p-4 cursor-pointer hover:bg-muted/50 flex items-start gap-3 transition-colors border-l-2 border-transparent",
                                            isActive && "bg-primary/5 border-primary",
                                            isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <div className="mt-0.5">
                                            {isLocked ? <Lock size={16} className="text-muted-foreground" /> :
                                                lesson.isCompleted ? <CheckCircle2 size={16} className="text-green-500" /> :
                                                    isActive ? <PlayCircle size={16} className="text-primary fill-primary/20" /> :
                                                        <Circle size={16} className="text-muted-foreground" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("text-sm font-medium leading-tight", isActive && "text-primary", isLocked && "text-muted-foreground")}>
                                                {index + 1}. {lesson.title}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                                                {lesson.videoUrl ? 'Video' : 'Text'}
                                                {lesson.fileUrl && ' • Resource'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {assignments?.length > 0 && (
                            <div className="py-2 border-t mt-2">
                                <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignments</h3>
                                {assignments.map((assignment: any) => {
                                    const isActive = activeType === 'assignment' && activeItem?.id === assignment.id;
                                    return (
                                        <div
                                            key={assignment.id}
                                            onClick={() => {
                                                setActiveItem(assignment);
                                                setActiveType('assignment');
                                            }}
                                            className={cn(
                                                "p-4 cursor-pointer hover:bg-muted/50 flex items-start gap-3 transition-colors border-l-2 border-transparent",
                                                isActive && "bg-purple-500/5 border-purple-500"
                                            )}
                                        >
                                            <div className="mt-0.5">
                                                <FileText size={16} className={cn("text-muted-foreground", isActive && "text-purple-500")} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn("text-sm font-medium leading-tight", isActive && "text-purple-500")}>{assignment.title}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No date'}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CustomScrollArea>
                </aside>
            </div>
        </div>
    );
}
