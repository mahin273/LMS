import { useState, useEffect } from 'react';
import { PlusCircle, Upload, FileText, Trash2, ArrowLeft, MoreVertical, LayoutDashboard, Users, BarChart3, Settings, BookOpen, Video, PlayCircle, Save, AlertTriangle, File as FileIcon } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from "@/components/ui/progress";
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function EditCoursePage() {
    const { courseId } = useParams();
    const queryClient = useQueryClient();
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const { register: registerCourse, handleSubmit: handleSubmitCourse, reset: resetCourse } = useForm();
    const navigate = useNavigate();

    const { data: lessons, isLoading: isLoadingLessons } = useQuery({
        queryKey: ['lessons', courseId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/lessons`);
            return res.data;
        }
    });

    const { data: course, isLoading: isLoadingCourse } = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const res = await client.get('/courses/instructor');
            return res.data.find((c: any) => c.id === courseId);
        }
    });

    useEffect(() => {
        if (course) {
            resetCourse({
                title: course.title,
                description: course.description
            });
        }
    }, [course, resetCourse]);

    const updateCourseMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.put(`/courses/${courseId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
            toast.success("Course details updated successfully");
        },
        onError: () => {
            toast.error("Failed to update course details");
        }
    });

    const createLessonMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.post(`/courses/${courseId}/lessons`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
            setIsAddingLesson(false);
            reset();
            toast.success("Lesson created successfully");
        }
    });

    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFileUrl(res.data.url);
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("File upload failed");
        } finally {
            setUploading(false);
        }
    };

    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

    const updateLessonMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.put(`/lessons/${editingLessonId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
            setIsAddingLesson(false);
            setEditingLessonId(null);
            setFileUrl(null);
            reset();
            toast.success("Lesson updated successfully");
        }
    });

    const onAddLesson = (data: any) => {
        let cleanVideoUrl = data.videoUrl;
        if (cleanVideoUrl && cleanVideoUrl.includes('<iframe')) {
            const srcMatch = cleanVideoUrl.match(/src=["'](.*?)["']/);
            if (srcMatch && srcMatch[1]) {
                cleanVideoUrl = srcMatch[1];
            }
        }

        const lessonData = {
            ...data,
            videoUrl: cleanVideoUrl,
            fileUrl: fileUrl || undefined
        };

        if (editingLessonId) {
            updateLessonMutation.mutate(lessonData);
        } else {
            createLessonMutation.mutate({
                ...lessonData,
                orderIndex: lessons ? lessons.length + 1 : 1,
            });
        }
    };

    const handleEditLesson = (lesson: any) => {
        setEditingLessonId(lesson.id);
        setIsAddingLesson(true);
        setFileUrl(lesson.fileUrl);
        setTimeout(() => {
            reset({
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl
            });
        }, 0);
    };

    const submitCourseMutation = useMutation({
        mutationFn: async () => {
            return client.post(`/courses/${courseId}/submit`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            toast.success("Course submitted for review");
        },
        onError: () => {
            toast.error("Failed to submit course");
        }
    });

    if (isLoadingCourse || isLoadingLessons) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted"></div>
                    <div className="h-4 w-32 rounded bg-muted"></div>
                </div>
            </div>
        )
    }

    const onUpdateCourse = (data: any) => {
        updateCourseMutation.mutate(data);
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                {course?.title}
                            </h1>
                            <Badge
                                variant={course?.status === 'published' ? 'default' : course?.status === 'pending' ? 'secondary' : 'outline'}
                                className={cn(
                                    course?.status === 'published' && "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
                                    course?.status === 'pending' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                                )}
                            >
                                {course?.status || 'draft'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                            <LayoutDashboard className="h-3 w-3" /> Course Management Panel
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {course?.status === 'draft' && (
                        <Button
                            onClick={() => {
                                if (confirm("Submit this course for admin approval? You won't be able to edit it while pending.")) {
                                    submitCourseMutation.mutate();
                                }
                            }}
                            disabled={submitCourseMutation.isPending}
                            className="shadow-lg shadow-primary/20"
                        >
                            {submitCourseMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                        </Button>
                    )}
                    <Link to={`/courses/${courseId}`}>
                        <Button variant="outline">View as Student</Button>
                    </Link>
                </div>
            </div>

            <Separator className="bg-border/50" />

            <Tabs defaultValue="lessons" className="w-full">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border/50 rounded-none mb-6 gap-6 relative overflow-x-auto selection-none">
                    <TabsTrigger
                        value="lessons"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 hover:text-primary transition-all"
                    >
                        <BookOpen className="h-4 w-4 mr-2" /> Curriculum
                    </TabsTrigger>
                    <TabsTrigger
                        value="students"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 hover:text-primary transition-all"
                    >
                        <Users className="h-4 w-4 mr-2" /> Students
                    </TabsTrigger>
                    <TabsTrigger
                        value="assignments"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 hover:text-primary transition-all"
                    >
                        <FileText className="h-4 w-4 mr-2" /> Assignments
                    </TabsTrigger>
                    <TabsTrigger
                        value="analytics"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 hover:text-primary transition-all"
                    >
                        <BarChart3 className="h-4 w-4 mr-2" /> Analytics
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 hover:text-primary transition-all"
                    >
                        <Settings className="h-4 w-4 mr-2" /> Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="lessons" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lesson List */}
                        <Card className="lg:col-span-2 border-border/50 bg-card/40 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Course Content</CardTitle>
                                    <CardDescription>Drag and drop to reorder lessons (coming soon).</CardDescription>
                                </div>
                                {!isAddingLesson && (
                                    <Button onClick={() => { setIsAddingLesson(true); setEditingLessonId(null); reset({ title: '', content: '', videoUrl: '' }); setFileUrl(null); }} size="sm">
                                        <PlusCircle className="h-4 w-4 mr-2" /> Add Lesson
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {lessons?.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                                        <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="text-muted-foreground">Start building your curriculum by adding the first lesson.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {lessons?.map((lesson: any, index: number) => (
                                            <div key={lesson.id} className="group flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <h4 className="font-medium text-sm">{lesson.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {lesson.videoUrl && (
                                                                <Badge variant="outline" className="text-[10px] h-5 gap-1 border-blue-500/20 text-blue-500">
                                                                    <Video className="h-3 w-3" /> Video
                                                                </Badge>
                                                            )}
                                                            {lesson.fileUrl && (
                                                                <Badge variant="outline" className="text-[10px] h-5 gap-1 border-purple-500/20 text-purple-500">
                                                                    <FileIcon className="h-3 w-3" /> File
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson)}>Edit</Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            if (confirm("Delete lesson?")) {
                                                                client.delete(`/lessons/${lesson.id}`)
                                                                    .then(() => {
                                                                        toast.success("Lesson deleted");
                                                                        queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
                                                                    })
                                                                    .catch(err => toast.error("Failed to delete lesson"));
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Editor Panel */}
                        <div className={cn("lg:col-span-1 transition-all duration-500", !isAddingLesson && "hidden lg:block lg:opacity-50 lg:pointer-events-none")}>
                            {isAddingLesson ? (
                                <Card className="border-primary/50 bg-card/60 backdrop-blur-md shadow-2xl sticky top-24">
                                    <CardHeader className="pb-3 border-b border-border/50">
                                        <CardTitle className="text-lg">{editingLessonId ? 'Edit Lesson' : 'New Lesson'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <form onSubmit={handleSubmit(onAddLesson)} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input {...register('title', { required: true })} placeholder="e.g., Intro to Hooks" className="bg-background/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Content (Markdown)</Label>
                                                <Textarea
                                                    {...register('content', { required: true })}
                                                    className="min-h-[150px] bg-background/50 resize-y font-mono text-xs"
                                                    placeholder="# Lesson Content..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Video Embed URL</Label>
                                                <div className="relative">
                                                    <Video className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input {...register('videoUrl')} placeholder="https://www.youtube.com/embed/..." className="pl-9 bg-background/50" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Attachment</Label>
                                                <Input type="file" onChange={handleFileUpload} disabled={uploading} className="bg-background/50 cursor-pointer text-xs" />
                                                {uploading && <Progress value={50} className="h-1" />}
                                                {fileUrl && <p className="text-xs text-green-500 flex items-center gap-1"><FileIcon className="h-3 w-3" /> Attached successfully</p>}
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button type="submit" className="flex-1" disabled={createLessonMutation.isPending || updateLessonMutation.isPending || uploading}>
                                                    {createLessonMutation.isPending || updateLessonMutation.isPending ? 'Saving...' : 'Save Lesson'}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => { setIsAddingLesson(false); setEditingLessonId(null); setFileUrl(null); }} className="flex-1">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground hidden lg:block">
                                    <p>Select "Add Lesson" or edit an existing one to see details here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="max-w-2xl mx-auto border-border/50 bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                            <CardDescription>Update your course information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitCourse(onUpdateCourse)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Course Title</Label>
                                    <Input {...registerCourse('title', { required: true })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea {...registerCourse('description', { required: true })} className="min-h-[100px] bg-background/50" />
                                </div>
                                <Button type="submit" disabled={updateCourseMutation.isPending} className="w-full">
                                    {updateCourseMutation.isPending ? 'Saving...' : 'Update Course'}
                                </Button>
                            </form>

                            <Separator className="my-8 bg-destructive/20" />

                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                                <div className="flex items-center gap-3 mb-2 text-destructive">
                                    <AlertTriangle className="h-5 w-5" />
                                    <h3 className="font-semibold">Danger Zone</h3>
                                </div>
                                <p className="text-sm text-destructive/80 mb-4">
                                    Deleting this course is permanent and cannot be undone. All lessons and student data will be lost.
                                </p>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => {
                                        const confirmText = prompt("Type 'DELETE' to confirm course deletion:");
                                        if (confirmText === 'DELETE') {
                                            client.delete(`/courses/${courseId}`)
                                                .then(() => {
                                                    toast.success("Course deleted");
                                                    navigate('/dashboard');
                                                })
                                                .catch(() => toast.error("Failed to delete course"));
                                        }
                                    }}
                                >
                                    Delete Course
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students">
                    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Enrolled Students</CardTitle>
                                    <CardDescription>View all students enrolled in this course.</CardDescription>
                                </div>
                                <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                                    {course?.students?.length || 0} Total
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {course?.students?.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No students enrolled yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {course?.students?.map((student: any) => (
                                        <Card key={student.id} className="bg-background/40 border-border/50">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-medium truncate">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments">
                    <AssignmentsTab courseId={courseId!} lessons={lessons || []} />
                </TabsContent>

                <TabsContent value="analytics">
                    <AnalyticsTab courseId={courseId!} />
                </TabsContent>
            </Tabs >
        </div >
    );
}

function AnalyticsTab({ courseId }: { courseId: string }) {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['analytics', courseId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/analytics`);
            return res.data;
        }
    });

    if (isLoading) return <div className="h-40 flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading analytics...</p></div>;

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Student Progress Analytics</CardTitle>
                <CardDescription>Track completion rates and engagement.</CardDescription>
            </CardHeader>
            <CardContent>
                {analytics?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No student data available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {analytics?.map((item: any) => (
                            <div key={item.student.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                            {item.student.name.charAt(0)}
                                        </div>
                                        <span className="font-medium">{item.student.name}</span>
                                    </div>
                                    <span className="font-bold text-primary">{item.progress}%</span>
                                </div>
                                <Progress value={item.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground text-right pt-1">
                                    <span className="font-medium text-foreground">{item.completedLessons}</span> of {item.totalLessons} lessons completed
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function AssignmentsTab({ courseId, lessons }: { courseId: string, lessons: any[] }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    const { data: assignments, isLoading } = useQuery({
        queryKey: ['assignments', courseId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/assignments`);
            return res.data;
        }
    });

    const createAssignmentMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.post(`/courses/${courseId}/assignments`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
            reset();
            toast.success("Assignment created successfully");
        }
    });

    const deleteAssignmentMutation = useMutation({
        mutationFn: async (id: string) => {
            return client.delete(`/assignments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
            toast.success("Assignment deleted");
        }
    });

    const onSubmit = (data: any) => {
        createAssignmentMutation.mutate(data);
    };

    if (isLoading) return <div className="h-40 flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading assignments...</p></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50 bg-card/40 backdrop-blur-sm h-fit">
                <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                    <CardDescription>Manage course assignments and review specific submissions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {assignments?.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                            <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground">No assignments created yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments?.map((assignment: any) => (
                                <div key={assignment.id} className="p-4 border border-border/50 rounded-lg flex justify-between items-center bg-background/50 hover:border-primary/30 transition-all">
                                    <div>
                                        <p className="font-semibold text-sm">{assignment.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 shadow-sm" onClick={() => setSelectedAssignmentId(assignment.id)}>
                                                    View Submissions
                                                </Button>
                                            </DialogTrigger>
                                            {selectedAssignmentId === assignment.id && (
                                                <SubmissionsDialog assignmentId={assignment.id} courseId={courseId} />
                                            )}
                                        </Dialog>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if (confirm("Delete assignment?")) deleteAssignmentMutation.mutate(assignment.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60 backdrop-blur-md sticky top-6 h-fit">
                <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-lg">New Assignment</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input {...register('title', { required: true })} placeholder="Week 1 Assignment" className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input type="date" {...register('dueDate')} className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Related Lesson</Label>
                            <select
                                {...register('lessonId')}
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">No specific lesson</option>
                                {lessons?.map((l: any) => (
                                    <option key={l.id} value={l.id}>{l.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Instructions</Label>
                            <Textarea {...register('description')} placeholder="Detailed instructions..." className="bg-background/50 min-h-[100px]" />
                        </div>
                        <Button type="submit" disabled={createAssignmentMutation.isPending} className="w-full">
                            {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function SubmissionsDialog({ assignmentId, courseId }: { assignmentId: string, courseId: string }) {
    const queryClient = useQueryClient();
    const { data: submissions, isLoading } = useQuery({
        queryKey: ['submissions', assignmentId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/assignments/${assignmentId}/submissions`);
            return res.data;
        }
    });

    const gradeMutation = useMutation({
        mutationFn: async ({ id, grade, feedback }: any) => {
            return client.put(`/assignments/submissions/${id}/grade`, { grade, feedback });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] });
            toast.success("Grade saved");
        }
    });

    if (isLoading) return <DialogContent>Loading submissions...</DialogContent>;

    return (
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
                <DialogTitle>Student Submissions</DialogTitle>
                <DialogDescription>Review and grade student work.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
                {submissions?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No submissions to review yet.</p>
                    </div>
                ) : (
                    submissions?.map((sub: any) => (
                        <div key={sub.id} className="p-4 border border-border/50 rounded-lg space-y-3 bg-background/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm">{sub.student.name}</p>
                                    <p className="text-xs text-muted-foreground">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                            <FileIcon className="h-3 w-3" /> View File
                                        </Button>
                                    </a>
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-xs mb-1.5 block">Grade (0-100)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={sub.grade}
                                        className="h-8 bg-background"
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            if (val && val !== String(sub.grade)) {
                                                gradeMutation.mutate({ id: sub.id, grade: parseInt(val), feedback: sub.feedback });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-xs mb-1.5 block">Feedback</Label>
                                    <Input
                                        defaultValue={sub.feedback}
                                        placeholder="Enter feedback..."
                                        className="h-8 bg-background"
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            if (val !== sub.feedback) {
                                                gradeMutation.mutate({ id: sub.id, grade: sub.grade, feedback: val });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DialogContent>
    );
}
